# CampusCommute

CampusCommute is a web platform designed for colleges and universities to calculate, monitor, and mitigate daily student and staff transportation emissions. It allows commuters to log their travel modes, measures their individual carbon footprints, connects nearby peers for 4-seat carpooling, and provides administrators with a campus-wide emissions dashboard and policy "what-if" simulator.

---

## 1. What the Project Is

College campuses generate substantial Scope 3 indirect greenhouse gas emissions through daily student and faculty commutes. CampusCommute addresses this challenge by providing:
- **Commute Tracker (`/log`)**: Simple, mobile-friendly logging with OpenStreetMap Nominatim debounced autocomplete for neighborhoods in Bengaluru.
- **Personal Footprint (`/me`)**: Quantifies individual weekly and annual kg CO2, translates it into the equivalent number of mature trees required for carbon sequestration, compares it against the campus average, and highlights the carbon savings achieved by switching to the bus or carpooling.
- **Campus Dashboard (`/campus`)**: Aggregated metrics across all university commuters, modal breakdown charts, top high-emission neighborhoods table, and an interactive Leaflet map with circle markers sized by neighborhood carbon output.
- **Peer Carpool Matcher (`/carpool`)**: Automatically matches commuters living within a 3 km radius who arrive within 30 minutes of each other, calculating the exact CO2 saved if the group shares one 4-seat car.
- **What-If Policy Simulator (`/simulator`)**: Live policy modeling allowing campus sustainability leaders to simulate shifts of solo car trips to BMTC bus transit and motorcycle/scooter trips to carpools, instantly visualizing kg CO2 saved and percentage reduction through before/after comparison charts.

---

## 2. How the Calculation Works

### A. Distance Calculation
1. **Coordinates**: Origin coordinates (latitude and longitude) are resolved via the OpenStreetMap Nominatim geocoding API or selected from common campus localities. Campus destination coordinates are configured in `lib/campus-config.ts` (default: RV Institute of Technology and Management, Bengaluru: `12.8797° N, 77.5838° E`).
2. **Straight-Line Distance**: Computed using the spherical **Haversine formula**:
   $$d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
   where $R = 6371\text{ km}$.
3. **Road Distance Factor**: Bengaluru urban road networks are not straight lines. Straight-line distance is multiplied by a road winding factor of **1.3**:
   $$\text{Road Distance (km)} = \text{Haversine Distance} \times 1.3$$

### B. Emissions Calculation
Commuters travel round trips (to campus and return home). For a student travelling $D$ road kilometers one-way, $N$ days per week, using travel mode $M$ with emission factor $EF_M$:
- **Weekly Travel Distance**: $D_{\text{week}} = 2 \times D \times N\text{ km}$
- **Weekly CO2 (kg)**: $\text{CO2}_{\text{week}} = D_{\text{week}} \times EF_M$
- **Annual CO2 (kg)**: $\text{CO2}_{\text{year}} = \text{CO2}_{\text{week}} \times 52\text{ weeks}$

### C. Tree Absorption Equivalence
According to standard urban forestry and EPA greenhouse gas equivalency models, one mature urban tree absorbs approximately **21.77 kg CO2 per year**.
$$\text{Trees Needed} = \frac{\text{CO2}_{\text{year}}}{21.77}$$

### D. Carpool Group Calculation
When 4 commuters share 1 petrol car instead of travelling individually, one vehicle covers the route instead of separate trips:
- Shared car weekly factor per passenger: $\approx \frac{0.17}{4} = 0.0425\text{ kg CO2 / passenger-km}$.
- Weekly savings: $\text{Baseline Group Emissions} - \text{Shared Car Emissions}$.

---

## 3. Emission Factor Sources

All factors are maintained centrally in `lib/emission-factors.ts` in **kg CO2 per passenger-kilometer (kg CO2 / pkm)**:

| Mode | Fuel / Type | Factor (kg CO2/pkm) | Source / Benchmark Reference |
| :--- | :--- | :---: | :--- |
| **Car (Petrol)** | Petrol | **0.17** | Indian sub-compact/compact petrol passenger cars with average occupancy |
| **Car (Diesel)** | Diesel | **0.17** | Indian compact diesel passenger cars with average occupancy |
| **Motorcycle / Scooter** | Petrol | **0.10** | Indian two-wheeler internal combustion engine average commute emissions |
| **Auto-Rickshaw** | CNG / LPG / Petrol | **0.08** | Indian urban three-wheeler average passenger-km |
| **Bus** | Diesel (BMTC) | **0.09** | Urban city bus with typical passenger load factors (40–60 passengers) |
| **Metro** | Electric Rail | **0.04** | Namma Metro Bengaluru electric rail using India Central Electricity Authority grid factor |
| **EV Car** | Electric | **0.09** | Battery electric passenger car accounting for India grid generation mix |
| **EV Two-Wheeler** | Electric | **0.03** | Lightweight battery electric scooter with India grid generation mix |
| **Bicycle** | Human Powered | **0.00** | Active non-motorized transport |
| **Walk** | Pedestrian | **0.00** | Active non-motorized transport |

> **TODO Notice**: These figures are approximate reference values. Replace these values with formal emission figures from **GHG Platform India** or UK **DEFRA Conversion Factors** before final institutional submission.

---

## 4. Sample Data for Demonstration

The campus-wide dashboard, carpool matching database, and policy simulator incorporate a seeded dataset of **100 sample commuters** (`lib/sample-data.ts`). This reproduces realistic Bengaluru modal shares (30% bus, 24% two-wheeler, 17% metro, 15% car, 5% auto, 6% EV, 3% active) across neighborhoods such as JP Nagar, Jayanagar, Banashankari, BTM Layout, HSR Layout, Koramangala, and Electronic City. 

Any commute entries submitted by users through `/log` are saved locally in the browser (`localStorage`) and automatically merged into the 100 records in real time. The campus dashboard displays a visible label stating: **"Sample data for demonstration"**.

---

## 5. Local Setup & Deployment

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### Installation & Run
```bash
# 1. Clone or navigate to the project directory
cd "Campus Transportation Emissions"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build Verification
To verify that the production build passes for Vercel deployment:
```bash
npm run build
```

---

## 6. Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict typing, zero `any` types)
- **Styling**: Tailwind CSS (custom `#081849` navy, high-contrast WCAG AA accessible palette)
- **Charts**: Recharts (responsive bar and donut charts)
- **Mapping**: Leaflet & `react-leaflet` (SSR-safe dynamic loader, OpenStreetMap tiles)
- **Geocoding**: OpenStreetMap Nominatim API with 300ms debounce and 1-second query rate-limiting
- **Icons**: Lucide React
