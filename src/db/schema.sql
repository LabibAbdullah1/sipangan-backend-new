-- Schema DDL for SIPANGAN
-- Database: sipangan_db

CREATE DATABASE IF NOT EXISTS sipangan_db;
USE sipangan_db;

-- 1. Regions table (Jawa Timur: 38 regencies/cities)
CREATE TABLE IF NOT EXISTS regions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('KABUPATEN', 'KOTA') NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Commodities table
CREATE TABLE IF NOT EXISTS commodities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    het DECIMAL(15, 2) DEFAULT 0.00, -- Harga Eceran Tertinggi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Historical Prices table (3NF)
CREATE TABLE IF NOT EXISTS historical_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id INT NOT NULL,
    commodity_id INT NOT NULL,
    price_date DATE NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_price (region_id, commodity_id, price_date)
);

-- 4. Prediction Prices table (Output from KA LSTM model)
CREATE TABLE IF NOT EXISTS prediction_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region_id INT NOT NULL,
    commodity_id INT NOT NULL,
    target_date DATE NOT NULL,
    predicted_price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
    FOREIGN KEY (commodity_id) REFERENCES commodities(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prediction (region_id, commodity_id, target_date)
);

-- 5. Admin Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);