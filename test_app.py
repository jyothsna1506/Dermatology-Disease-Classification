import urllib.request
import json

def test_full_pipeline():
    print("========================================")
    print("DERMATOLOGY APP INTEGRATION TEST")
    print("========================================")

    # 1. Test Backend Health
    health_url = "http://127.0.0.1:8000/health"
    req = urllib.request.Request(health_url)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        health_data = json.loads(resp.read().decode("utf-8"))
        print("[PASS] Backend /health check:")
        print(f"       Status: {health_data['status']}, Model: {health_data['model_name']}, Features: {health_data['features_count']}")

    # 2. Test Metadata
    meta_url = "http://127.0.0.1:8000/metadata"
    req = urllib.request.Request(meta_url)
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        meta = json.loads(resp.read().decode("utf-8"))
        print("[PASS] Backend /metadata check:")
        print(f"       Classes: {len(meta['disease_classes'])}, Presets: {len(meta['sample_presets'])}")

    # 3. Test /predict with real dataset samples for all 6 disease classes
    print("\n--- Testing Direct /predict API (Port 8000) on Real Test Samples ---")
    for cls_id in ["1", "2", "3", "4", "5", "6"]:
        preset = meta["sample_presets"][cls_id]
        payload = json.dumps(preset["features"]).encode("utf-8")
        pred_req = urllib.request.Request(
            "http://127.0.0.1:8000/predict",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(pred_req) as resp:
            assert resp.status == 200
            res = json.loads(resp.read().decode("utf-8"))
            pred_id = res["predicted_class"]
            pred_name = res["disease_name"]
            conf = res["confidence_percentage"]
            top_prob = res["probabilities"][0]["disease_name"]
            print(f"  [Sample Class {cls_id}: {preset['disease_name']:<25}] -> Pred: Class {pred_id} ({pred_name:<25}) | Conf: {conf:>7} (Top Prob: {top_prob})")

    # 4. Test Frontend-to-Backend Proxy (Port 5173 /api/predict)
    print("\n--- Testing Frontend-to-Backend Proxy (Port 5173 -> Port 8000) ---")
    sample_psoriasis = meta["sample_presets"]["1"]["features"]
    proxy_payload = json.dumps(sample_psoriasis).encode("utf-8")
    proxy_req = urllib.request.Request(
        "http://127.0.0.1:5173/api/predict",
        data=proxy_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(proxy_req) as resp:
        assert resp.status == 200
        proxy_res = json.loads(resp.read().decode("utf-8"))
        print(f"[PASS] Proxy /api/predict correctly forwarded to FastAPI:")
        print(f"       Disease: {proxy_res['disease_name']}, Confidence: {proxy_res['confidence_percentage']}")

    # 5. Test Vite Frontend Serving
    vite_req = urllib.request.Request("http://127.0.0.1:5173/")
    with urllib.request.urlopen(vite_req) as resp:
        assert resp.status == 200
        html = resp.read().decode("utf-8")
        assert "DermAI" in html or "root" in html
        print(f"[PASS] Frontend HTML successfully served by Vite dev server (HTTP {resp.status})")

    # 6. Test FastAPI Built Frontend Serving
    unified_req = urllib.request.Request("http://127.0.0.1:8000/")
    with urllib.request.urlopen(unified_req) as resp:
        assert resp.status == 200
        unified_html = resp.read().decode("utf-8")
        assert "DermAI" in unified_html or "root" in unified_html
        print(f"[PASS] Built Frontend HTML successfully served by FastAPI directly on :8000 (HTTP {resp.status})")

    print("\n========================================")
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("========================================")

if __name__ == "__main__":
    test_full_pipeline()
