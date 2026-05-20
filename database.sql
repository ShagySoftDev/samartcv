CREATE DATABASE solar_plan_system;

USE solar_plan_system;

CREATE TABLE calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_energy FLOAT,
    panel_size FLOAT,
    battery_capacity FLOAT,
    inverter_size FLOAT,
    estimated_cost FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
