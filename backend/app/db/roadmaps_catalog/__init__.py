"""Technea 100+ Production-Grade Roadmaps Catalog.

Structured across 9 domains with 112 comprehensive, highly detailed roadmaps.
"""

from app.db.roadmaps_catalog.cat1_programming import PROGRAMMING_ROADMAPS
from app.db.roadmaps_catalog.cat2_web_development import WEB_DEV_ROADMAPS
from app.db.roadmaps_catalog.cat3_ai_ml import AI_ML_ROADMAPS
from app.db.roadmaps_catalog.cat4_data import DATA_ROADMAPS
from app.db.roadmaps_catalog.cat5_cloud_devops import CLOUD_DEVOPS_ROADMAPS
from app.db.roadmaps_catalog.cat6_cybersecurity import CYBERSECURITY_ROADMAPS
from app.db.roadmaps_catalog.cat7_mobile import MOBILE_ROADMAPS
from app.db.roadmaps_catalog.cat8_design_creative import DESIGN_CREATIVE_ROADMAPS
from app.db.roadmaps_catalog.cat9_career import CAREER_ROADMAPS

ALL_ROADMAPS = (
    PROGRAMMING_ROADMAPS
    + WEB_DEV_ROADMAPS
    + AI_ML_ROADMAPS
    + DATA_ROADMAPS
    + CLOUD_DEVOPS_ROADMAPS
    + CYBERSECURITY_ROADMAPS
    + MOBILE_ROADMAPS
    + DESIGN_CREATIVE_ROADMAPS
    + CAREER_ROADMAPS
)
