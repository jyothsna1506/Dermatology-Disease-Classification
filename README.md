# Dermatology Disease Classification Web Application

A full-stack clinical decision support web application for erythemato-squamous dermatology disease classification. Powered by a **Gaussian Naive Bayes** classifier trained on the UCI Dermatology dataset, a high-performance **FastAPI** backend, and a modern healthcare dashboard built with **React, Vite, and Tailwind CSS**.

---

## 🏛️ System Architecture

```text
React/Vite Frontend
       ↓
   FastAPI API
       ↓
Gaussian Naive Bayes
       ↓
Dermatology Prediction
```

- **Frontend:** React 18 + Vite + Tailwind CSS medical interface featuring stepped navigation between Clinical Findings (11) and Histopathological Findings (22), real-time progress tracking, 6 verified benchmark presets, and interactive differential diagnosis ranking.
- **Backend API:** FastAPI REST service providing Pydantic schema validation, strictly preserved 33-feature ordering, error handling, CORS headers, and dual-mode serving.
- **Machine Learning Model:** Scikit-Learn `GaussianNB` serialized to `model/gaussian_nb.joblib` (5 KB) with full class posterior probability output.
- **Prediction Output:** Predicted erythemato-squamous disease, ICD-10 clinical code, patient prediction confidence ($P(\text{Disease} \mid X)$), and differential probability distribution across all 6 classes.

---

## 📌 Project Overview

Dermatological erythemato-squamous diseases share very similar physical symptoms (such as erythema and scaling), making clinical differential diagnosis difficult without microscopic histopathological examination.

This production web application allows clinicians and researchers to input 33 standardized clinical and histopathological observations, run inference using the pre-trained Gaussian Naive Bayes model, view predicted diagnoses with confidence percentages, and examine full differential probability distributions.

> **Medical Disclaimer:** This application is intended for educational, informational, and clinical research support only. It does **not** constitute medical advice or a definitive diagnosis. Always consult a qualified dermatologist or physician for clinical care and histopathological evaluation.

---

## 🔬 Dataset & ML Pipeline

### Dataset
- **Source:** UCI Dermatology Dataset (`dermatologyDataset.csv`)
- **Instances:** 366 clinical records
- **Total Columns:** 35 (33 features + 1 age column + 1 class target)

### Target Disease Classes (6 Classes)
The model classifies lesions into one of 6 erythemato-squamous diseases:
1. **Class 1 — Psoriasis** (ICD-10: `L40`)
2. **Class 2 — Seborrheic Dermatitis** (ICD-10: `L21`)
3. **Class 3 — Lichen Planus** (ICD-10: `L43`)
4. **Class 4 — Pityriasis Rosea** (ICD-10: `L42`)
5. **Class 5 — Chronic Dermatitis** (ICD-10: `L30`)
6. **Class 6 — Pityriasis Rubra Pilaris** (ICD-10: `L44.0`)

### 33 Input Features
All features are scored on an ordinal clinical scale: `0` (Absent), `1` (Mild), `2` (Moderate), `3` (Severe / Maximum), except `family_history` which is binary `0` (No) or `1` (Yes).

#### Clinical Findings (11 Features)
- `erythema`: Redness of the skin caused by hyperemic capillaries (0-3)
- `scaling`: Flaking or peeling of the stratum corneum (0-3)
- `definite_borders`: Sharp demarcation between affected lesion and normal skin (0-3)
- `itching`: Pruritus severity (0-3)
- `koebner_phenomenon`: Appearance of lesions at trauma/scratch sites (0-3)
- `polygonal_papules`: Angular flat-topped lesions characteristic of Lichen Planus (0-3)
- `follicular_papules`: Small inflammatory papules centered on hair follicles (0-3)
- `oral_mucosal_involvement`: Reticular lesions/streaks inside oral mucosa (0-3)
- `knee_and_elbow_involvement`: Preferential presentation over extensor surfaces (0-3)
- `scalp_involvement`: Involvement of hair-bearing scalp (0-3)
- `family_history`: History of similar dermatoses in relatives (0: No, 1: Yes)

#### Histopathological Findings (22 Biopsy Features)
- `melanin_incontinence`: Melanin pigment dropped into papillary dermis (0-3)
- `eosinophils_infiltrate`: Infiltration of eosinophils (0-3)
- `PNL_infiltrate`: Polymorphonuclear neutrophil infiltration (0-3)
- `fibrosis_papillary_dermis`: Fibrosis and collagen deposition in upper dermis (0-3)
- `exocytosis`: Transmigration of inflammatory cells into epidermis (0-3)
- `acanthosis`: Epidermal thickening of the spinous layer (0-3)
- `hyperkeratosis`: Thickening of the stratum corneum (0-3)
- `parakeratosis`: Retention of keratinocyte nuclei in stratum corneum (0-3)
- `clubbing_rete_ridges`: Bulbous club-shaped elongation of rete pegs (0-3)
- `elongation_rete_ridges`: Downward elongation of interpapillary rete ridges (0-3)
- `thinning_suprapapillary_epidermis`: Thinning of epidermis over dermal papillae (0-3)
- `spongiform_pustule`: Intraepidermal multilocular pustules (Kogoj) (0-3)
- `munro_microabcess`: Neutrophil aggregates in stratum corneum (0-3)
- `focal_hypergranulosis`: Localized prominent granular cell layer (0-3)
- `disappearance_granular_layer`: Loss or absence of granular layer (0-3)
- `vacuolisation_damage_basal_layer`: Vacuolar degeneration of basal cells (0-3)
- `spongiosis`: Intercellular epidermal edema (0-3)
- `saw_tooth_appearance_retes`: Jagged triangular rete peg contour (0-3)
- `follicular_horn_plug`: Dense keratin plug within follicular ostia (0-3)
- `perifollicular_parakeratosis`: Parakeratosis concentrated around follicles (0-3)
- `inflammatory_mononuclear_infiltrate`: Dermal lymphocytic/histiocytic infiltrate (0-3)
- `band_like_infiltrate`: Band-shaped lymphocytic infiltrate at DEJ (0-3)

### Preprocessing & Model Training
- **Feature Selection:** First 33 columns (`df.iloc[:, 0:33]`), strictly preserving feature ordering. The `age` column is bypassed to prevent missing-value distortion, exactly as established in the research notebook.
- **Split:** Train/Test split (80/20, `random_state=0`) and Train/Val split (70/30, `random_state=42`).
- **Model:** Scikit-learn `GaussianNB()` fitted on `X_train, y_train`.
- **Benchmark Generalization Accuracy:** **83.78% test accuracy** (validated on held-out test split).
- **Serialization:** Pre-trained model serialized to `model/gaussian_nb.joblib` (5 KB, included in repository) and metadata saved to `model/metadata.json`.

---

## 🎨 Frontend Architecture

The user interface is built as a responsive healthcare assessment tool:
- **Two-Step Categorized Assessment:** Segmented navigation between **Clinical Findings (11)** and **Histopathological Findings (22)** with progress pill (`X of 33 active`).
- **Interactive Medical Tooltips:** Plain-English clinical descriptions explaining every symptom and histological term.
- **Segmented Scale Buttons:** Intuitive 4-level segmented buttons (`0: Absent`, `1: Mild`, `2: Moderate`, `3: Severe`) with color-coded active states.
- **Verified Benchmark Test Presets:** 6 one-click preset buttons corresponding to verified test cases from the UCI dataset for all 6 diseases.
- **Prominent Prediction Card:** Displays predicted disease, ICD-10 code, disease background, and individual prediction confidence meter.
- **Differential Probabilities Chart:** Ranked list (`#1` to `#6`) with animated width meters and probability percentages for differential diagnosis analysis.
- **Model Specifications & Distinction Card:** Clear breakdown explaining the distinction between the global model benchmark test accuracy (83.78%) and the individual Bayesian prediction confidence for a specific patient.

---

## ⚡ FastAPI Backend

The backend is built with FastAPI:
- Strict Pydantic input validation enforcing valid ranges (`ge=0, le=3` for ordinal features, `ge=0, le=1` for family history).
- Pre-loaded model on startup via lifespan context manager.
- Zero raw dataset or model internals exposed through the API.
- Endpoints:
  - `POST /predict`: Generates diagnosis and differential probabilities.
  - `GET /metadata`: Returns feature schemas, clinical descriptions, and test presets.
  - `GET /health`: Health status and loaded model details.
  - `GET /docs`: Interactive Swagger documentation.

---

## 📁 Project Structure

```text
Dermatology-Disease-Classification/
├── backend/
│   ├── main.py              # FastAPI server with /predict, /metadata, /health
│   ├── schemas.py           # Pydantic validation schemas & response models
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Medical dashboard, form, results, & presets
│   │   ├── main.jsx         # React application entrypoint
│   │   └── index.css        # Tailwind CSS and global styling
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies and build scripts
│   ├── vite.config.js       # Vite configuration with API reverse proxy
│   └── tailwind.config.js   # Tailwind theme customizations
├── model/
│   ├── train.py             # Reproducible training & artifact generation script
│   ├── gaussian_nb.joblib   # Serialized trained Gaussian Naive Bayes model (5 KB)
│   └── metadata.json        # Feature dictionary, descriptions, and test presets
├── dermatologyDataset.csv   # Original dataset
├── dermatology_disease_classification.ipynb.ipynb # Original research notebook
├── test_app.py              # Automated end-to-end integration test suite
├── render.yaml              # Render Web Service Infrastructure-as-Code specification
├── .gitignore               # Ignores node_modules, .venv, caches
└── README.md                # Project documentation
```

---

## 🚀 Running the Application Locally

### Prerequisites
- **Python 3.10+** (verified on Python 3.13)
- **Node.js 18+** & **npm**

---

### Step 1: Install Python Dependencies & Train/Load Model

The repository already includes the trained model binary (`model/gaussian_nb.joblib`). You can install dependencies and optionally retrain:

```bash
# 1. Install backend requirements
pip install -r backend/requirements.txt

# 2. (Optional) Re-train and verify the model:
python model/train.py
```

---

### Step 2: Install Frontend Dependencies & Build

```bash
cd frontend
npm install
npm run build
cd ..
```

---

### Step 3: Run the Application

You can run the application in either mode:

#### Option A: Unified Server (FastAPI serves API + Built Frontend)

Run this single command from the project root:

```bash
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```

- **Web Application:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### Option B: Full Development Mode (FastAPI + Vite Hot Reload)

Open two terminals:

**Terminal 1 (Backend):**
```bash
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
```

- **Vite Dev App:** [http://127.0.0.1:5173](http://127.0.0.1:5173) (requests are automatically proxied to `:8000`)

---

## ☁️ Deployment (Render Web Service)

This application is ready for 1-click single-service deployment on **Render** using the included [`render.yaml`](render.yaml) blueprint.

### Service Settings
- **Service Type:** Web Service
- **Runtime:** `Python 3.11`
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `uvicorn main:app --app-dir backend --host 0.0.0.0 --port $PORT`

### Steps to Deploy
1. Sign in to [Render](https://render.com).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository: `https://github.com/jyothsna1506/Dermatology-Disease-Classification`.
4. Render will automatically detect [`render.yaml`](render.yaml) and configure the build and start commands.
5. Click **Apply**. Render will build the environment and launch your application.

### Deployed Application Endpoints
Once deployed, your service will be live at:
- **Web Application Dashboard:** `https://<your-service-name>.onrender.com/`
- **Prediction API Endpoint:** `https://<your-service-name>.onrender.com/predict` (or `/api/predict`)
- **Health Check Endpoint:** `https://<your-service-name>.onrender.com/health`
- **Interactive Swagger Documentation:** `https://<your-service-name>.onrender.com/docs`

---

## 🧪 Testing & Verification

An automated integration test suite is included:

```bash
python test_app.py
```

### Verified Test Results

```text
========================================
DERMATOLOGY APP INTEGRATION TEST
========================================
[PASS] Backend /health check:
       Status: healthy, Model: Gaussian Naive Bayes, Features: 33
[PASS] Backend /metadata check:
       Classes: 6, Presets: 6

--- Testing Direct /predict API (Port 8000) on Real Test Samples ---
  [Sample Class 1: Psoriasis                ] -> Pred: Class 1 (Psoriasis                ) | Conf: 100.00%
  [Sample Class 2: Seborrheic Dermatitis    ] -> Pred: Class 2 (Seborrheic Dermatitis    ) | Conf: 100.00%
  [Sample Class 3: Lichen Planus            ] -> Pred: Class 3 (Lichen Planus            ) | Conf: 100.00%
  [Sample Class 4: Pityriasis Rosea         ] -> Pred: Class 4 (Pityriasis Rosea         ) | Conf: 100.00%
  [Sample Class 5: Chronic Dermatitis       ] -> Pred: Class 5 (Chronic Dermatitis       ) | Conf: 100.00%
  [Sample Class 6: Pityriasis Rubra Pilaris ] -> Pred: Class 6 (Pityriasis Rubra Pilaris ) | Conf: 100.00%

--- Testing Frontend-to-Backend Proxy (Port 5173 -> Port 8000) ---
[PASS] Proxy /api/predict correctly forwarded to FastAPI:
       Disease: Psoriasis, Confidence: 100.00%
[PASS] Frontend HTML successfully served by Vite dev server (HTTP 200)
[PASS] Built Frontend HTML successfully served by FastAPI directly on :8000 (HTTP 200)

========================================
ALL TESTS PASSED SUCCESSFULLY!
========================================
```

---

## 📡 API Specification

### `POST /predict`
Evaluates the 33-feature clinical and biopsy vector.

#### Request Body (JSON)
```json
{
  "erythema": 2,
  "scaling": 2,
  "definite_borders": 0,
  "itching": 3,
  "koebner_phenomenon": 0,
  "polygonal_papules": 0,
  "follicular_papules": 0,
  "oral_mucosal_involvement": 0,
  "knee_and_elbow_involvement": 0,
  "scalp_involvement": 0,
  "family_history": 0,
  "melanin_incontinence": 0,
  "eosinophils_infiltrate": 0,
  "PNL_infiltrate": 0,
  "fibrosis_papillary_dermis": 0,
  "exocytosis": 1,
  "acanthosis": 2,
  "hyperkeratosis": 0,
  "parakeratosis": 0,
  "clubbing_rete_ridges": 0,
  "elongation_rete_ridges": 0,
  "thinning_suprapapillary_epidermis": 0,
  "spongiform_pustule": 0,
  "munro_microabcess": 0,
  "focal_hypergranulosis": 0,
  "disappearance_granular_layer": 0,
  "vacuolisation_damage_basal_layer": 0,
  "spongiosis": 3,
  "saw_tooth_appearance_retes": 0,
  "follicular_horn_plug": 0,
  "perifollicular_parakeratosis": 0,
  "inflammatory_mononuclear_infiltrate": 1,
  "band_like_infiltrate": 0
}
```

#### Response Body (JSON)
```json
{
  "status": "success",
  "predicted_class": 5,
  "disease_name": "Chronic Dermatitis",
  "icd_ref": "L30",
  "description": "Long-standing eczema/dermatitis characterized by thickened skin (lichenification), scaling, erythema, and persistent itching.",
  "confidence": 1.0,
  "confidence_percentage": "100.00%",
  "probabilities": [
    {
      "class_id": 5,
      "disease_name": "Chronic Dermatitis",
      "icd_ref": "L30",
      "probability": 1.0,
      "percentage": "100.00%"
    },
    {
      "class_id": 1,
      "disease_name": "Psoriasis",
      "icd_ref": "L40",
      "probability": 0.0,
      "percentage": "0.00%"
    }
  ],
  "features_submitted": 33,
  "disclaimer": "Medical Disclaimer: This prediction is generated by a Machine Learning model..."
}
```

---

## 🛡️ License & Attribution

- Built around the UCI Machine Learning Dermatology Repository dataset.
- Developed with Python FastAPI, Scikit-Learn, and React Vite.
