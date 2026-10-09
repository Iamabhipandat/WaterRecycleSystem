# JalLoop — Smart Water Recycling System

JalLoop is a smart water-recycling dashboard and IoT prototype for monitoring, controlling, and visualizing the reuse of wastewater from reverse-osmosis systems, washing machines, and rainwater collection.

The project combines a React web dashboard, Firebase Realtime Database, ESP32 firmware, and a Wokwi hardware simulation. It supports both **Demo Mode**, which runs entirely in the browser, and **Live Mode**, which synchronizes sensor data and control commands with an ESP32 device.

## Features

- Monitor collection, recycled-water, and fresh-water tank levels.
- Visualize the complete recycling flow from water sources to reuse destinations.
- Simulate RO wastewater, washing-machine water, and rainwater collection.
- Control recycling, filtration, pumping, and reuse operations.
- Display filtration stages and system activity logs.
- View water usage and recycling analytics.
- Synchronize dashboard state with ESP32 hardware in Live Mode.
- Read tank levels using ultrasonic sensors.
- Estimate water quality using a turbidity input.
- Control and monitor hardware LEDs for each stage of the system.
- Authenticate users with Firebase Authentication.
- Provide an admin dashboard for authorized administrators.
- Run the hardware design in Wokwi before deploying to physical hardware.

## System Architecture

```text
                    +---------------------------+
                    |       React Dashboard      |
                    |  Demo Mode / Live Mode     |
                    +-------------+-------------+
                                  |
                    Firebase Realtime Database
                                  |
          +-----------------------+-----------------------+
          |                       |                       |
   sensorData                 commands              hardware/leds
          |                       |                       |
          |                       |                       |
          v                       v                       v
   Dashboard metrics       ESP32 control logic       ESP32 LED state
                                  |
                                  v
                    +---------------------------+
                    |          ESP32              |
                    |  Sensors, button, LEDs      |
                    +-------------+-------------+
                                  |
             +--------------------+--------------------+
             |                    |                    |
       Tank sensors         Turbidity sensor       Pump button
```

### Main components

1. **React frontend**
   - Renders the dashboard, authentication pages, administrator view, flow visualization, metrics, charts, and system status.
   - Maintains local state for Demo Mode.
   - Sends commands and displays sensor data when Live Mode is enabled.

2. **Firebase integration**
   - Firebase Authentication manages user sessions.
   - Firebase Realtime Database transports sensor readings, control commands, device status, and LED states.
   - The React application subscribes to `sensorData` and writes to `commands` and `hardware/leds`.

3. **ESP32 firmware**
   - Reads ultrasonic tank sensors and the turbidity input.
   - Converts sensor readings into percentages, liters, and water-quality values.
   - Uploads readings to Firebase approximately every two seconds.
   - Polls Firebase commands approximately every 800 milliseconds.
   - Reads dashboard LED state approximately every 400 milliseconds.
   - Controls system LEDs and responds to the physical pump button.

4. **Wokwi simulation**
   - Provides a virtual ESP32 circuit.
   - Simulates three HC-SR04 ultrasonic sensors, a turbidity potentiometer, a pump button, status LEDs, filtration LEDs, and reuse LEDs.

## Data Flow

### Live sensor data

```text
Ultrasonic sensors / turbidity input
                |
                v
          ESP32 firmware
                |
                | PATCH /sensorData.json
                v
     Firebase Realtime Database
                |
                | onValue subscription
                v
         useFirebaseData hook
                |
                v
         React dashboard state
```

The ESP32 publishes values such as:

- `collectionPct`
- `collectionLiters`
- `recycledPct`
- `recycledLiters`
- `freshTankPct`
- `freshLiters`
- `turbidity`
- `waterQuality`
- `pumpRunning`
- `filterActive`
- `filtrationStage`
- `roActive`
- `washingActive`
- `rainActive`
- `reuseActive`
- `uptime`

### Dashboard commands

```text
Dashboard controls
        |
        v
useFirebaseData.sendCommand()
        |
        | update /commands
        v
Firebase Realtime Database
        |
        | GET /commands.json
        v
ESP32 firmware
        |
        v
Pump, filtration state, sources, and reuse state
```

Supported command fields include `pump`, `filtration`, `filtrationStage`, `ro`, `washing`, `rain`, `reuse`, and `reset`.

### LED synchronization

The dashboard derives LED states from the current system state using `src/utils/hardware.js`. In Live Mode, those states are written to `hardware/leds`. The ESP32 reads the values and applies them to the physical or simulated LEDs.

## Project Structure

```text
WaterRecycleSystem/
├── firmware/
│   └── jalloop_esp32.ino       # ESP32 firmware for real hardware
├── wokwi/
│   ├── diagram.json             # Virtual circuit layout and wiring
│   ├── libraries.txt            # Wokwi/PlatformIO libraries
│   ├── platformio.ini            # PlatformIO configuration
│   ├── sketch.ino                # Wokwi sketch entry point
│   └── wokwi.toml                # Wokwi project configuration
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                   # Images and static frontend assets
│   ├── components/               # Reusable dashboard UI components
│   │   ├── ActivityLog.jsx
│   │   ├── Analytics.jsx
│   │   ├── HardwareLeds.jsx
│   │   ├── KpiCard.jsx
│   │   ├── ModeToggle.jsx
│   │   ├── Navbar.jsx
│   │   ├── RecyclingFlow.jsx
│   │   ├── SimulationControls.jsx
│   │   ├── SystemStatus.jsx
│   │   ├── WaterFlowSystem.jsx
│   │   ├── WaterMetrics.jsx
│   │   ├── WaterTank.jsx
│   │   └── WaterUsageChart.jsx
│   ├── config/
│   │   └── appConfig.js          # Admin email and invitation configuration
│   ├── context/
│   │   └── AuthContext.jsx        # Global authentication and admin state
│   ├── hooks/
│   │   ├── useAuth.js             # Authentication helper hook
│   │   └── useFirebaseData.js      # Live Firebase subscriptions and commands
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AuthPage.jsx
│   │   └── LoginPage.jsx
│   ├── services/
│   │   └── firebase.js             # Firebase app, database, and auth setup
│   ├── utils/
│   │   └── hardware.js             # Converts application state into LED state
│   ├── App.jsx                      # Main application state and dashboard layout
│   ├── index.css                    # Global styles
│   └── main.jsx                     # React application entry point
├── database.rules.json              # Firebase Realtime Database rules
├── package.json                     # Scripts and dependencies
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite configuration
└── README.md
```

## Operating Modes

### Demo Mode

Demo Mode runs without a connected ESP32. The browser simulates:

- Water entering the collection tank.
- Filtration stages.
- Pump operation.
- Recycled-water usage.
- System warnings and activity logs.

This mode is useful for demonstrations, UI development, and testing without hardware.

### Live Mode

Live Mode connects the dashboard to Firebase and the ESP32. The dashboard:

- Subscribes to live sensor data.
- Sends pump, filtration, source, reuse, and reset commands.
- Synchronizes LED states with the ESP32.
- Shows the connection state and stale-data status.

The application treats sensor data as stale when no update has been received for approximately eight seconds.

## Technology Stack

- **Frontend:** React 19, React DOM
- **Build tool:** Vite
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Charts:** Recharts
- **Icons:** Lucide React
- **Backend services:** Firebase Authentication and Firebase Realtime Database
- **Embedded platform:** ESP32
- **Firmware language:** C++ / Arduino framework
- **Hardware simulation:** Wokwi
- **Linting:** Oxlint

## Getting Started

### Prerequisites

Install the following tools:

- Node.js 18 or newer
- npm
- An optional ESP32 board for hardware testing
- An optional Wokwi account for simulation

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:5173
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

### Run linting

```bash
npm run lint
```

## Firebase Setup

The application uses Firebase Authentication and Firebase Realtime Database.

1. Create or select a Firebase project.
2. Enable the authentication providers required by the application.
3. Create a Realtime Database.
4. Configure the Firebase web application settings in `src/services/firebase.js`.
5. Deploy or apply the rules from `database.rules.json`.
6. Ensure the ESP32 firmware uses the same Realtime Database URL.
7. Add authorized administrator email addresses and invitation settings in `src/config/appConfig.js`.

The primary Realtime Database paths are:

```text
users/{uid}          User profile data
presence/{uid}       User presence information
sensorData           Latest ESP32 sensor readings
commands             Commands sent from the dashboard to the ESP32
hardware/leds        LED state synchronized from the dashboard
device               ESP32 status and firmware information
```

## ESP32 Firmware Setup

1. Open `firmware/jalloop_esp32.ino` in the Arduino IDE or another ESP32-compatible environment.
2. Install the required libraries:
   - WiFi
   - HTTPClient
   - ArduinoJson
3. Set the Wi-Fi credentials:

```cpp
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
```

4. Confirm that `FIREBASE_URL` points to the project Realtime Database.
5. Connect the sensors, button, LEDs, and any required resistors according to the pin definitions in the firmware.
6. Select the correct ESP32 board and upload the firmware.
7. Open the serial monitor at `115200` baud.
8. Start the dashboard and enable Live Mode.

### ESP32 pin summary

| Function | GPIO |
| --- | ---: |
| Collection tank trigger / echo | 5 / 18 |
| Recycled tank trigger / echo | 19 / 21 |
| Fresh tank trigger / echo | 22 / 23 |
| Turbidity input | 34 |
| Pump button | 0 |
| System LED | 25 |
| RO LED | 4 |
| Washing LED | 12 |
| Rain LED | 14 |
| Collection LED | 27 |
| Filter stage 1 LED | 26 |
| Filter stage 2 LED | 16 |
| Filter stage 3 LED | 33 |
| Pump LED | 32 |
| Recycled LED | 15 |
| Toilet reuse LED | 2 |
| Garden reuse LED | 17 |
| Cleaning reuse LED | 13 |

## Wokwi Simulation

The `wokwi/` directory contains a virtual ESP32 setup with:

- ESP32 DevKit
- Three HC-SR04 ultrasonic sensors
- A potentiometer representing turbidity
- A pump push button
- System, source, filtration, pump, recycled-water, and reuse LEDs

Open the project in Wokwi and use the firmware configuration appropriate for the simulator. The wiring in `wokwi/diagram.json` follows the GPIO definitions in `firmware/jalloop_esp32.ino`.

## Security Considerations

Before using this project outside a controlled prototype environment:

- Do not commit production secrets, passwords, or private credentials.
- Move Firebase configuration into environment variables where appropriate.
- Review `database.rules.json` carefully. The prototype currently allows unauthenticated reads and writes for several hardware paths, including `sensorData`, `commands`, `hardware`, and `device`.
- Restrict database access to authenticated users and authorized devices.
- Validate all commands received by the ESP32.
- Use Firebase Authentication, App Check, and least-privilege database rules for production deployments.
- Rotate any credentials that may have been exposed in source control.

## Troubleshooting

### Dashboard stays disconnected in Live Mode

- Confirm that Firebase is initialized successfully.
- Check the Realtime Database URL.
- Verify that the ESP32 is connected to Wi-Fi.
- Confirm that the ESP32 is updating `sensorData`.
- Check browser and ESP32 serial logs for Firebase errors.
- Ensure the latest sensor update is less than eight seconds old.

### ESP32 does not respond to dashboard controls

- Confirm that Live Mode is enabled.
- Check that the dashboard can write to `commands`.
- Verify that the ESP32 is polling `/commands.json`.
- Check the Firebase database rules.
- Inspect the serial monitor for HTTP response codes.

### LEDs do not match the dashboard

- Confirm that the dashboard is writing to `hardware/leds`.
- Verify the GPIO wiring and resistor connections.
- Check that the firmware is polling `/hardware/leds.json`.
- Confirm that the selected GPIO pins match the firmware and Wokwi diagram.

## Contributing

1. Create a feature branch.
2. Make focused changes.
3. Run `npm run lint` and `npm run build`.
4. Test both Demo Mode and Live Mode when hardware or Firebase is available.
5. Open a pull request with a clear description of the change.

## License

No license has been specified for this repository yet. Add a `LICENSE` file before distributing or reusing the project publicly.

## Project Status

JalLoop is an actively developed prototype for smart water recycling monitoring and control. The web dashboard, Firebase integration, ESP32 firmware, and Wokwi simulation are designed to evolve together as the hardware and recycling workflow are refined.
