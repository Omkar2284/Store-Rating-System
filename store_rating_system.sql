-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 15, 2026 at 07:38 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `store_rating_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `store_id`, `rating`, `created_at`) VALUES
(1, 4, 1, 5, '2026-05-14 19:15:11'),
(2, 4, 2, 4, '2026-05-14 19:15:13'),
(3, 4, 3, 3, '2026-05-14 19:15:16'),
(4, 5, 2, 4, '2026-05-14 19:28:09'),
(5, 5, 1, 3, '2026-05-14 19:28:12'),
(6, 5, 3, 5, '2026-05-14 19:28:14');

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `address` varchar(400) NOT NULL,
  `email` varchar(255) NOT NULL,
  `owner_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `name`, `address`, `email`, `owner_id`) VALUES
(1, 'Chai Point', 'Shop No. 4, M.G. Road, Near Railway Station, Pune', 'contact@starbucks.com', 6),
(2, 'Haldiram Sweets', 'Sector 17, Vashi, Navi Mumbai, 400703', 'info@nike.com', NULL),
(3, 'Apollo Pharmacy', 'G-12, Indiranagar 80 Feet Road, Bengaluru', 'hello@burgerjoint.com', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(400) NOT NULL,
  `role` enum('Admin','Normal','StoreOwner') NOT NULL DEFAULT 'Normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `address`, `role`, `created_at`) VALUES
(3, 'System Administrator', 'admin@platform.com', '$2a$10$w8gZ9YshzCen0Gf7yK00duoGg2h2.Gid77u6lR6P7V9fI.38b0Nbe', 'Main Admin HQ', 'Admin', '2026-05-14 19:01:41'),
(4, 'Omkar Somwanshi Developer ', 'testuser@gmail.com', '$2a$10$3jrEtSZzgVNnWlMCmAykL.w7IFd0jUxpyw4qhY884byJEIKMhSpPW', 'pune', 'Normal', '2026-05-14 19:14:37'),
(5, 'Omkar Somwanshi Tester', 'omkar@tester.com', '$2a$10$Qw1N1cpSwmwM.CmAHFu4GurWTqPG3nKokUaDiCtzVG3kTz5.BexcG', 'Saswad', 'Normal', '2026-05-14 19:28:04'),
(6, 'Rahul Sharma (Manager)', 'rahul.sharma@chaipoint.in', '$2a$10$w8gZ9YshzCen0Gf7yK00duoGg2h2.Gid77u6lR6P7V9fI.38b0Nbe', 'Downtown', 'StoreOwner', '2026-05-14 19:36:41'),
(8, 'Omkar Somwanshi Developer ', 'omkar@platform.com', '$2a$10$y8swxU.rZDlaHRA/MtReuu5DsWEfN7TaNHJVVcpiX.jK6py0ZMkrq', 'pune', 'Normal', '2026-05-14 20:22:34');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_store_rating` (`user_id`,`store_id`),
  ADD KEY `store_id` (`store_id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `owner_id` (`owner_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stores`
--
ALTER TABLE `stores`
  ADD CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
