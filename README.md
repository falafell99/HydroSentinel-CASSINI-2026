# 🛰️ HydroSentinel: AI-Driven Flood Intelligence
### *11th CASSINI Hackathon 2026 | Challenge: Disaster Risk Management*

---

> **"Transforming Space Data into Life-Saving Minutes."**
> 
> HydroSentinel is a real-time flood monitoring and emergency coordination platform. We fuse **Copernicus Sentinel-1 SAR** data with **Galileo High-Accuracy Positioning** to detect flash floods through dense cloud cover and coordinate precision rescue efforts where standard GPS fails.

---

## 🚩 The Problem
Traditional flood monitoring is often "blind" during the most critical moments of a disaster:
* **The Cloud Gap:** Optical satellites (like Sentinel-2) cannot see through the storm clouds that cause the floods in the first place.
* **The Accuracy Gap:** Standard GPS has a 5-10 meter error margin—dangerously high when navigating submerged urban streets or narrow rescue channels.
* **The Action Gap:** Raw satellite data is too complex for first responders. They need clear, natural-language instructions, not just raw heatmaps.

---

## 🚀 Space-Powered Solution

We leverage the European Space Ecosystem to create a closed-loop emergency response cycle:

### 🛰️ The Eyes: Copernicus Sentinel-1
We utilize **Synthetic Aperture Radar (SAR)** imagery. SAR pulses microwave signals that penetrate clouds, smoke, and darkness to "see" the Earth's surface.
* **Change Detection:** Our algorithm compares a "Golden Baseline" (dry land) against the "Current Pass" (flood event) to automatically isolate water polygons in near-real-time.

### 📍 The Pulse: Galileo & EGNOS
Precision is a requirement for saving lives, not a luxury.
* **Galileo HAS:** We utilize the **High Accuracy Service** to provide sub-meter precision for rescue drones and ground teams.
* **EGNOS:** Ensures signal integrity and reliability, which is critical for autonomous emergency vehicles navigating through debris.

---

## ✨ Key Features

* **☁️ Cloud-Proof Mapping:** Near-real-time flood polygon generation based on SAR backscatter analysis.
* **🚑 Precision Dispatch:** Galileo-enabled pathfinding that avoids submerged power lines and high-depth "trap zones."
* **🤖 AI Dispatcher:** Integration with **Google Gemini 1.5 Pro** to transform raw GIS data into localized, multi-lingual SMS alerts for residents.
* **📊 Predictive Risk Score:** Fuses Sentinel-3 soil moisture data with weather APIs to predict "First-to-Flood" zones 6 hours before the water arrives.

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
1. **Ingestion:** Automated fetching of Sentinel-1 products via the Copernicus Data Space Ecosystem.
2. **Processing:** SAR Speckle filtering + Binarization using Python/Rasterio.
3. **Inference:** AI model identifies flooded building footprints via OpenStreetMap (OSM) overlay.
4. **Delivery:** High-performance Mapbox Dashboard + AI-automated SMS alerting via Twilio.

---

## 📂 Repository Structure

```text
├── data/                  # Sample GeoJSONs (Flood polygons & test data)
├── notebooks/             # SAR processing & AI model training experiments
├── src/
│   ├── processor.py       # The "Brain": SAR Change Detection logic
│   ├── galileo_sync.py    # Galileo HAS coordinate correction module
│   └── alerts.py          # Gemini-powered emergency message generator
├── web/                   # Streamlit Dashboard UI
├── requirements.txt       # Python dependencies
└── README.md              # You are here!

```

⚡ Quick Start
1. Prerequisites

An account at the Copernicus Data Space Ecosystem.

A valid Mapbox API Token.

2. Installation

Bash
# Clone the repository
git clone [https://github.com/yourteam/HydroSentinel.git](https://github.com/yourteam/HydroSentinel.git)

# Navigate to the directory
cd HydroSentinel

# Install the geospatial dependencies
pip install -r requirements.txt

# Launch the interactive Dashboard
streamlit run web/app.py
👥 The Crew

Rafael Ibayev — Lead Systems Architect & Full-Stack Developer

Jaloliddin Ismailov - Chief Environmental Engineer & Security Analyst

Nursultan Tuleev — AI & Geospatial Intelligence Lead



📜 License & Acknowledgements
Developed specifically for the 11th CASSINI Hackathon 2026. This project utilizes data provided by the European Union’s Copernicus and Galileo programs.


---

### **Final checklist before you push to GitHub:**
1. **The Link:** In the `# Clone the repository` section, make sure the URL is actually your real GitHub repo link.
2. **The Images:** If you have a logo or a screenshot of the map, put it in the `data/` folder and add `![Screenshot](data/screenshot.png)` at the top of the README.
3. **The Team:** Make sure to actually put your friends' names in the `The Crew` section! 

**Would you like me to create a "Pitch Deck" outline so your Creative Lead can start building the slides?**
