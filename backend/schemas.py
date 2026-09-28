"""
Pydantic schemas for request validation and response formatting.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class DermatologyInputFeatures(BaseModel):
    # Clinical Features (Scale 0-3, except family_history which is 0-1)
    erythema: int = Field(0, ge=0, le=3, description="Redness of the skin (0: Absent, 1: Mild, 2: Moderate, 3: Severe)")
    scaling: int = Field(0, ge=0, le=3, description="Scaling or flaking of skin (0-3)")
    definite_borders: int = Field(0, ge=0, le=3, description="Sharpness of lesion borders (0-3)")
    itching: int = Field(0, ge=0, le=3, description="Itching/Pruritus severity (0-3)")
    koebner_phenomenon: int = Field(0, ge=0, le=3, description="Appearance of lesions at trauma sites (0-3)")
    polygonal_papules: int = Field(0, ge=0, le=3, description="Presence of multi-sided flat papules (0-3)")
    follicular_papules: int = Field(0, ge=0, le=3, description="Papules localized around hair follicles (0-3)")
    oral_mucosal_involvement: int = Field(0, ge=0, le=3, description="Lesions inside the mouth/mucosa (0-3)")
    knee_and_elbow_involvement: int = Field(0, ge=0, le=3, description="Lesions on knees and elbows (0-3)")
    scalp_involvement: int = Field(0, ge=0, le=3, description="Lesions on the scalp (0-3)")
    family_history: int = Field(0, ge=0, le=1, description="Family history of disease (0: No, 1: Yes)")

    # Histopathological Features (Scale 0-3)
    melanin_incontinence: int = Field(0, ge=0, le=3, description="Melanin pigment in papillary dermis (0-3)")
    eosinophils_infiltrate: int = Field(0, ge=0, le=3, description="Infiltration of eosinophils (0-3)")
    PNL_infiltrate: int = Field(0, ge=0, le=3, description="Polymorphonuclear leukocyte infiltrate (0-3)")
    fibrosis_papillary_dermis: int = Field(0, ge=0, le=3, description="Fibrosis in upper dermis (0-3)")
    exocytosis: int = Field(0, ge=0, le=3, description="Exocytosis of inflammatory cells into epidermis (0-3)")
    acanthosis: int = Field(0, ge=0, le=3, description="Thickening of squamous cell layer (0-3)")
    hyperkeratosis: int = Field(0, ge=0, le=3, description="Thickening of stratum corneum (0-3)")
    parakeratosis: int = Field(0, ge=0, le=3, description="Retention of nuclei in stratum corneum (0-3)")
    clubbing_rete_ridges: int = Field(0, ge=0, le=3, description="Bulbous clubbing of rete pegs (0-3)")
    elongation_rete_ridges: int = Field(0, ge=0, le=3, description="Downward elongation of rete pegs (0-3)")
    thinning_suprapapillary_epidermis: int = Field(0, ge=0, le=3, description="Thinning over dermal papillae (0-3)")
    spongiform_pustule: int = Field(0, ge=0, le=3, description="Multilocular intraepidermal pustules (0-3)")
    munro_microabcess: int = Field(0, ge=0, le=3, description="Neutrophil aggregates in stratum corneum (0-3)")
    focal_hypergranulosis: int = Field(0, ge=0, le=3, description="Focal thickening of granular layer (0-3)")
    disappearance_granular_layer: int = Field(0, ge=0, le=3, description="Loss or thinning of granular layer (0-3)")
    vacuolisation_damage_basal_layer: int = Field(0, ge=0, le=3, description="Vacuolar degeneration of basal cells (0-3)")
    spongiosis: int = Field(0, ge=0, le=3, description="Intercellular edema in epidermis (0-3)")
    saw_tooth_appearance_retes: int = Field(0, ge=0, le=3, description="Saw-toothed pointed rete pegs (0-3)")
    follicular_horn_plug: int = Field(0, ge=0, le=3, description="Keratin plugs in hair follicles (0-3)")
    perifollicular_parakeratosis: int = Field(0, ge=0, le=3, description="Parakeratosis around hair follicles (0-3)")
    inflammatory_mononuclear_infiltrate: int = Field(0, ge=0, le=3, description="Mononuclear infiltrate in dermis (0-3)")
    band_like_infiltrate: int = Field(0, ge=0, le=3, description="Band-like subepidermal infiltrate (0-3)")

    class Config:
        json_schema_extra = {
            "example": {
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
        }

class ClassProbability(BaseModel):
    class_id: int
    disease_name: str
    icd_ref: str
    probability: float
    percentage: str

class PredictionResponse(BaseModel):
    status: str
    predicted_class: int
    disease_name: str
    icd_ref: str
    description: str
    confidence: float
    confidence_percentage: str
    probabilities: List[ClassProbability]
    features_submitted: int
    disclaimer: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    features_count: int
    classes_count: int
