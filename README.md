# 🛰️ HydroSentinel: AI-Driven Flood Intelligence
### *11th CASSINI Hackathon 2026 | Challenge: Disaster Risk Management*

---

> **"Transforming Space Data into Life-Saving Minutes."**
> 
> HydroSentinel is a real-time flood monitoring and emergency response platform. By fusing **Copernicus Sentinel-1 SAR** imagery with **Galileo High-Accuracy Positioning**, we detect flash floods through cloud cover and coordinate precision rescue efforts in environments where standard GPS fails.

---

## 🚩 The Problem
Traditional flood monitoring is often "blind" during the most critical moments:
* **The Cloud Gap:** Optical satellites (like Sentinel-2) cannot see through the storm clouds that cause the floods.
* **The Accuracy Gap:** Standard GPS has an error margin of 5-10m, which is life-threatening when navigating submerged urban streets or narrow channels.
* **The Action Gap:** Raw data is hard to read. First responders need clear, natural-language instructions, not just "heatmaps."

---

## 🚀 Our Space-Powered Solution

We leverage the full European Space Ecosystem to create a closed-loop emergency system:

### 🛰️ The Eyes: Copernicus Sentinel-1
We use **Synthetic Aperture Radar (SAR)**. SAR pulses microwave signals that bounce off the earth and penetrate clouds, smoke, and darkness. 
* **Change Detection:** Our algorithm compares "Golden Land" (baseline) vs. "Current Pass" (flood) to isolate water polygons automatically.

### 📍 The Pulse: Galileo & EGNOS
Precision is not a luxury; it's a requirement for rescue.
* **Galileo HAS:** We utilize the **High Accuracy Service** to provide sub-meter precision for rescue drones and ground teams.
* **EGNOS:** Ensures signal integrity, crucial for autonomous emergency vehicles navigating debris.

---

## ✨ Key Features

* **☁️ Cloud-Proof Mapping:** Near-real-time flood polygons generated from SAR backscatter analysis.
* **🚑 Precision Dispatch:** Galileo-enabled pathfinding that avoids submerged power lines and deep-water "trap zones."
* **🤖 AI Dispatcher:** Integrates **Google Gemini 1.5 Pro** to turn raw GIS data into localized, multi-lingual SMS alerts for residents.
* **📊 Predictive Risk Score:** Combines Sentinel-3 soil moisture data with weather APIs to predict "First-to-Flood" zones 6 hours in advance.

---

## 🛠️ Technical Implementation

### **The Tech Stack**
| Category | Technology |
| :--- | :--- |
| **Space Data** | Copernicus Sentinel-1, Sentinel-3, Galileo HAS |
| **Backend** | Python 3.12, FastAPI, PostgreSQL + PostGIS |
| **AI/ML** | PyTorch (U-Net for segmentation), Gemini API |
| **Geospatial** | GeoPandas, Rasterio, Sentinel-Hub API, Mapbox |

### **Project Architecture**
1.  **Ingestion:** Automated fetching of Sentinel-1 `.SAFE` products via Copernicus Data Space.
2.  **Processing:** SAR Speckle filtering + Binarization in Python.
3.  **Inference:** AI model identifies flooded building footprints via OpenStreetMap (OSM) overlay.
4.  **Delivery:** Live Mapbox Dashboard + Twilio SMS Alerting.

---

## 📂 Repository Structure

```text
├── data/                  # Sample GeoJSONs (Flood polygons)
├── notebooks/             # SAR processing & AI training experiments
├── src/
│   ├── processor.py       # The "Brain": SAR Change Detection logic
│   ├── galileo_sync.py    # Galileo HAS coordinate correction module
│   └── alerts.py          # Gemini-powered emergency message generator
├── web/                   # Streamlit Dashboard UI
├── requirements.txt       # Python dependencies
└── README.md              # You are here!
⚡ Quick Start
1. Prerequisites

Create an account at Copernicus Data Space Ecosystem.

Obtain a Mapbox API Token.

2. Installation

Bash
# Clone the repository
git clone [https://github.com/yourteam/HydroSentinel.git](https://github.com/yourteam/HydroSentinel.git)

# Move into the directory
cd HydroSentinel

# Install the geospatial stack
pip install -r requirements.txt

# Launch the Dashboard
streamlit run web/app.py
👥 The Crew
[Name] - Tech Lead | Full-stack & GIS Data Pipelines

[Name] - Space Specialist | SAR Image Processing & ESA Toolbox

[Name] - Product/Business | Market Analysis & UX Strategy

[Name] - Creative/Pitch | Presentation & Narrative Design

📜 License & Acknowledgements
Developed for the 11th CASSINI Hackathon 2026. This project uses data provided by the European Union’s Copernicus and Galileo programs.


---

### **Bonus: Your `requirements.txt` file**
Since you are working with satellite data, you need very specific libraries. Create a file named `requirements.txt` and paste this:

```text
# Core Data Science
numpy==1.26.4
pandas==2.2.0
geopandas==0.14.3

# Satellite & GIS
rasterio==1.3.9
shapely==2.0.3
sentinelsat==1.2.1
folium==0.15.1

# AI & Backend
fastapi==0.109.2
uvicorn==0.27.1
google-generativeai==0.4.0
torch==2.2.0

# Frontend
streamlit==1.31.1
