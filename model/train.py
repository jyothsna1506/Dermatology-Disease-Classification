"""
Model Training and Serialization for Dermatology Disease Classification
Exact reproduction of the notebook's Gaussian Naive Bayes model.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_and_export():
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "dermatologyDataset.csv")
    df = pd.read_csv(dataset_path)

    # Features (0:33) and Target (last column) matching notebook
    X = df.iloc[:, 0:33]
    y = df.iloc[:, -1]

    # Exact notebook split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.3, random_state=42)

    # Train Gaussian Naive Bayes model
    model = GaussianNB()
    model.fit(X_train, y_train)

    # Evaluate
    y_val_pred = model.predict(X_val)
    y_test_pred = model.predict(X_test)

    val_acc = float(accuracy_score(y_val, y_val_pred))
    test_acc = float(accuracy_score(y_test, y_test_pred))
    test_precision = float(precision_score(y_test, y_test_pred, average='micro'))
    test_recall = float(recall_score(y_test, y_test_pred, average='micro'))
    test_f1 = float(f1_score(y_test, y_test_pred, average='micro'))

    print(f"Validation Accuracy: {val_acc:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}")
    print(f"Test Precision: {test_precision:.4f}")
    print(f"Test Recall: {test_recall:.4f}")
    print(f"Test F1: {test_f1:.4f}")

    # Model directory
    model_dir = os.path.dirname(__file__)
    model_path = os.path.join(model_dir, "gaussian_nb.joblib")
    joblib.dump(model, model_path)
    print(f"Saved model to {model_path}")

    # Disease classes mapping
    disease_classes = {
        1: {
            "name": "Psoriasis",
            "icd_ref": "L40",
            "description": "A chronic autoimmune skin disease characterized by well-demarcated, erythematous plaques covered with silvery scales, commonly over extensor surfaces."
        },
        2: {
            "name": "Seborrheic Dermatitis",
            "icd_ref": "L21",
            "description": "A common inflammatory skin disorder affecting sebum-rich areas such as scalp, face, and chest, presenting with greasy scales over erythematous patches."
        },
        3: {
            "name": "Lichen Planus",
            "icd_ref": "L43",
            "description": "A chronic inflammatory condition of skin and mucous membranes characterized by pruritic, polygonal, violaceous flat-topped papules."
        },
        4: {
            "name": "Pityriasis Rosea",
            "icd_ref": "L42",
            "description": "An acute, self-limiting exanthem characterized by an initial herald patch followed by oval erythematous scaling lesions along skin cleavage lines."
        },
        5: {
            "name": "Chronic Dermatitis",
            "icd_ref": "L30",
            "description": "Long-standing eczema/dermatitis characterized by thickened skin (lichenification), scaling, erythema, and persistent itching."
        },
        6: {
            "name": "Pityriasis Rubra Pilaris",
            "icd_ref": "L44.0",
            "description": "A rare group of chronic disorders characterized by reddish-orange follicular papules, palmoplantar keratoderma, and islands of normal skin."
        }
    }

    # Features definitions
    features_metadata = [
        # Clinical Attributes (1-11)
        {
            "name": "erythema",
            "display_name": "Erythema",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Redness of the skin caused by increased blood flow in superficial capillaries."
        },
        {
            "name": "scaling",
            "display_name": "Scaling",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Flaking or peeling of the top layer of skin (stratum corneum)."
        },
        {
            "name": "definite_borders",
            "display_name": "Definite Borders",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Sharp demarcation between affected skin lesions and surrounding normal skin."
        },
        {
            "name": "itching",
            "display_name": "Itching (Pruritus)",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Subjective sensation provoking the desire to scratch affected skin."
        },
        {
            "name": "koebner_phenomenon",
            "display_name": "Koebner Phenomenon",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Appearance of new lesions at sites of mechanical trauma or skin irritation."
        },
        {
            "name": "polygonal_papules",
            "display_name": "Polygonal Papules",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Small, raised lesions with multi-sided angular borders (typical of Lichen Planus)."
        },
        {
            "name": "follicular_papules",
            "display_name": "Follicular Papules",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Small, inflammatory bumps located specifically around hair follicles."
        },
        {
            "name": "oral_mucosal_involvement",
            "display_name": "Oral Mucosal Involvement",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Presence of white lesions, reticular streaks, or ulcers in the mouth lining."
        },
        {
            "name": "knee_and_elbow_involvement",
            "display_name": "Knee & Elbow Involvement",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Prominent lesion presence over extensor surfaces (knees and elbows)."
        },
        {
            "name": "scalp_involvement",
            "display_name": "Scalp Involvement",
            "category": "Clinical",
            "type": "scale_0_3",
            "description": "Presence of erythematous or scaling lesions across the hairy scalp."
        },
        {
            "name": "family_history",
            "display_name": "Family History",
            "category": "Clinical",
            "type": "binary_0_1",
            "description": "History of similar dermatological diseases among direct family members (0: No, 1: Yes)."
        },
        # Histopathological Attributes (12-33)
        {
            "name": "melanin_incontinence",
            "display_name": "Melanin Incontinence",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Deposition of melanin pigment granules into the papillary dermis from basal layer damage."
        },
        {
            "name": "eosinophils_infiltrate",
            "display_name": "Eosinophils Infiltrate",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Infiltration of eosinophil granulocytes in tissue biopsy sections."
        },
        {
            "name": "PNL_infiltrate",
            "display_name": "PNL Infiltrate",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Infiltration of polymorphonuclear leukocytes (neutrophils) in tissue."
        },
        {
            "name": "fibrosis_papillary_dermis",
            "display_name": "Fibrosis of Papillary Dermis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Collagen deposition and early scarring in the upper superficial dermal layer."
        },
        {
            "name": "exocytosis",
            "display_name": "Exocytosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Migration of inflammatory mononuclear cells from dermis into the epidermis."
        },
        {
            "name": "acanthosis",
            "display_name": "Acanthosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Diffuse epidermal hyperplasia and thickening of the spinous layer."
        },
        {
            "name": "hyperkeratosis",
            "display_name": "Hyperkeratosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Excessive thickening of the outermost stratum corneum layer of skin."
        },
        {
            "name": "parakeratosis",
            "display_name": "Parakeratosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Retention of cell nuclei in the stratum corneum reflecting accelerated keratinization."
        },
        {
            "name": "clubbing_rete_ridges",
            "display_name": "Clubbing of Rete Ridges",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Club-shaped bulbous swelling and downward elongation of epidermal rete ridges."
        },
        {
            "name": "elongation_rete_ridges",
            "display_name": "Elongation of Rete Ridges",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Regular or irregular downward elongation of interpapillary rete ridges."
        },
        {
            "name": "thinning_suprapapillary_epidermis",
            "display_name": "Thinning of Suprapapillary Epidermis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Marked thinning of the epidermal layer overlying dermal papillae."
        },
        {
            "name": "spongiform_pustule",
            "display_name": "Spongiform Pustule",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Intercellular pustules created by neutrophil accumulations in spinous layer (Kogoj pustule)."
        },
        {
            "name": "munro_microabcess",
            "display_name": "Munro Microabscess",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Focal aggregates of pyknotic neutrophils within the stratum corneum."
        },
        {
            "name": "focal_hypergranulosis",
            "display_name": "Focal Hypergranulosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Focal thickening and prominent coarse keratohyalin granules in the granular layer."
        },
        {
            "name": "disappearance_granular_layer",
            "display_name": "Disappearance of Granular Layer",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Attenuated or absent stratum granulosum beneath parakeratotic areas."
        },
        {
            "name": "vacuolisation_damage_basal_layer",
            "display_name": "Vacuolisation of Basal Layer",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Liquefactive or hydropic degeneration of basal keratinocytes with vacuole formation."
        },
        {
            "name": "spongiosis",
            "display_name": "Spongiosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Intercellular edema within the epidermis widening spaces between keratinocytes."
        },
        {
            "name": "saw_tooth_appearance_retes",
            "display_name": "Saw-tooth Appearance of Retes",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Pointed, jagged triangular contour of the lower borders of rete pegs."
        },
        {
            "name": "follicular_horn_plug",
            "display_name": "Follicular Horn Plug",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Dense keratinous plug obstructing the infundibulum of hair follicles."
        },
        {
            "name": "perifollicular_parakeratosis",
            "display_name": "Perifollicular Parakeratosis",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Parakeratosis localized specifically surrounding follicular ostia."
        },
        {
            "name": "inflammatory_mononuclear_infiltrate",
            "display_name": "Inflammatory Mononuclear Infiltrate",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Presence of lymphocytes, histiocytes, and macrophages in dermal tissue."
        },
        {
            "name": "band_like_infiltrate",
            "display_name": "Band-like Infiltrate",
            "category": "Histopathological",
            "type": "scale_0_3",
            "description": "Dense horizontal band of lymphocytic infiltrate hugging the dermal-epidermal junction."
        }
    ]

    # Sample presets for each disease class from X_test for easy UI testing
    test_presets = {}
    for cls_id in range(1, 7):
        matching_indices = y_test[y_test == cls_id].index
        if len(matching_indices) > 0:
            idx = matching_indices[0]
            row_dict = {col: int(X.loc[idx, col]) for col in X.columns}
            test_presets[cls_id] = {
                "class_id": cls_id,
                "disease_name": disease_classes[cls_id]["name"],
                "sample_index": int(idx),
                "features": row_dict
            }

    metadata = {
        "model_name": "Gaussian Naive Bayes",
        "algorithm": "GaussianNB",
        "features": [f["name"] for f in features_metadata],
        "features_metadata": features_metadata,
        "disease_classes": disease_classes,
        "metrics": {
            "validation_accuracy": round(val_acc, 4),
            "test_accuracy": round(test_acc, 4),
            "test_precision": round(test_precision, 4),
            "test_recall": round(test_recall, 4),
            "test_f1": round(test_f1, 4)
        },
        "sample_presets": test_presets
    }

    metadata_path = os.path.join(model_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved metadata to {metadata_path}")

if __name__ == "__main__":
    train_and_export()
