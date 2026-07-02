# HCRL Car-Hacking Dataset

EdgeGuard uses the real-world **Car-Hacking Dataset** collected by the Hacking and Countermeasure Research Lab (HCRL) at Korea University. This dataset contains real CAN bus logs including normal traffic and injected attack messages (DoS, Fuzzy, Spoofing).

## Download Instructions

1. Visit the official dataset page: [https://ocslab.hksecurity.net/Datasets/car-hacking-dataset](https://ocslab.hksecurity.net/Datasets/car-hacking-dataset)
2. You will need to fill out a request form to obtain download access.
3. Once approved, download the following files:
   - `DoS_dataset.csv` (~181MB)
   - `Fuzzy_dataset.csv` (~189MB)
   - `gear_dataset.csv` (~220MB)
   - `RPM_dataset.csv` (Optional, ~240MB)
   - `normal_run_data` folder (extracted from `.7z`)

## Placement

Place all downloaded CSVs and the `normal_run_data` directory directly inside this `data/` folder. The structure should look like this:

```
EdgeGuard/
├── data/
│   ├── DoS_dataset.csv
│   ├── Fuzzy_dataset.csv
│   ├── gear_dataset.csv
│   ├── normal_run_data/
│   └── README.md
```

The system will automatically read from these files for training, evaluation, and live simulation.
