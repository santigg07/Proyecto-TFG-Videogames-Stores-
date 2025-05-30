-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: db:3306
-- Tiempo de generación: 29-05-2025 a las 02:15:00
-- Versión del servidor: 8.0.42
-- Versión de PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `videogames_store`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart_items`
--

CREATE TABLE `cart_items` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `game_id` int UNSIGNED NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `created_at`, `updated_at`) VALUES
(1, 'RPG', 'rpg', '2025-03-31 14:29:43', '2025-03-31 14:29:43'),
(2, 'Acción', 'accion', '2025-03-31 14:29:43', '2025-03-31 14:29:43'),
(3, 'Aventura', 'aventura', '2025-03-31 14:29:43', '2025-03-31 14:29:43'),
(4, 'Estrategia', 'estrategia', '2025-03-31 14:29:43', '2025-03-31 14:29:43'),
(5, 'Deportes', 'deportes', '2025-03-31 14:29:43', '2025-03-31 14:29:43'),
(6, 'Simulación', 'simulacion', '2025-03-31 14:29:43', '2025-03-31 14:29:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consoles`
--

CREATE TABLE `consoles` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `consoles`
--

INSERT INTO `consoles` (`id`, `name`, `slug`, `manufacturer`, `image`, `created_at`, `updated_at`) VALUES
(7, 'Xbox', 'xbox', 'Microsoft', 'consoles/xbox.jpg', '2025-04-11 16:52:36', '2025-04-11 22:44:56'),
(6, 'SEGA Mega Drive', 'mega-Drive', 'Sega', 'consoles/sega-genesis.jpg', '2025-04-11 16:52:36', '2025-05-29 00:26:39'),
(5, 'PlayStation 2', 'playstation-2', 'Sony', 'consoles/playstation-2.jpg', '2025-04-11 16:52:36', '2025-04-11 22:44:37'),
(4, 'PlayStation', 'playstation', 'Sony', 'consoles/playstation.jpg', '2025-04-11 16:52:36', '2025-04-11 22:44:25'),
(3, 'Nintendo 64', 'nintendo-64', 'Nintendo', 'consoles/nintendo-64.jpg', '2025-04-11 16:52:36', '2025-04-11 22:44:14'),
(2, 'Super Nintendo', 'super-nintendo', 'Nintendo', 'consoles/super-nintendo.jpg', '2025-04-11 16:52:36', '2025-04-11 22:44:05'),
(1, 'Nintendo NES', 'nintendo-nes', 'Nintendo', 'consoles/1748172694_LIrGkWjtWb.jpg', '2025-04-11 16:52:36', '2025-05-25 11:31:34'),
(30, 'Master System', 'master-system', 'Sega', 'consoles/1748173337_l9McMDCRn8.jpg', '2025-05-25 11:42:17', '2025-05-25 11:42:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `games`
--

CREATE TABLE `games` (
  `id` int NOT NULL,
  `console_id` int DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `release_year` int DEFAULT NULL,
  `condition` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `includes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `games`
--

INSERT INTO `games` (`id`, `console_id`, `name`, `slug`, `description`, `price`, `sale_price`, `stock`, `release_year`, `condition`, `manufacturer`, `includes`, `image`, `created_at`, `updated_at`) VALUES
(1, 1, 'Super Mario Bros', 'super-mario-bros', 'El clásico de plataformas que definió el género. Ayuda a Mario a rescatar a la princesa Peach de las garras de Bowser.', 49.99, NULL, 7, 1985, 'Usado - Buen estado', 'Nintendo', 'Cartucho y caja', 'games/super-mario-bros.jpg', '2025-04-11 16:53:51', '2025-05-28 17:12:28'),
(2, 1, 'The Legend of Zelda', 'the-legend-of-zelda', 'El primer juego de la emblemática saga Zelda. Acompaña a Link en su aventura para salvar a Hyrule.', 69.99, 59.99, 5, 1986, 'Coleccionista', 'Nintendo', 'Cartucho, caja y manual', 'games/zelda-nes.jpg', '2025-04-11 16:53:51', '2025-04-11 16:53:51'),
(3, 1, 'Metroid', 'metroid', 'El primer juego de la saga Metroid. Samus Aran debe derrotar a los piratas espaciales y a la Metroid Prime.', 59.99, NULL, 3, 1986, 'Usado - Buen estado', 'Nintendo', 'Solo cartucho', 'games/metroid-nes.jpg', '2025-04-11 16:53:51', '2025-04-11 16:53:51'),
(4, 2, 'Super Mario World', 'super-mario-world', 'Una de las mejores entregas de la saga Mario. Acompaña a Mario y Yoshi en esta aventura.', 59.99, NULL, 7, 1990, 'Usado - Muy buen estado', 'Nintendo', 'Cartucho y caja', 'games/super-mario-world.jpg', '2025-04-11 16:54:03', '2025-04-11 16:54:03'),
(5, 2, 'Super Metroid', 'super-metroid', 'Considerado uno de los mejores juegos de todos los tiempos. Samus regresa para enfrentar a su némesis.', 89.99, NULL, 4, 1994, 'Coleccionista', 'Nintendo', 'Cartucho, caja y manual', 'games/super-metroid.jpg', '2025-04-11 16:54:03', '2025-04-11 16:54:03'),
(6, 2, 'The Legend of Zelda: A Link to the Past', 'zelda-link-to-the-past', 'Una de las aventuras más emblemáticas de Link. Explora dos mundos paralelos en tu misión.', 79.99, 69.99, 6, 1991, 'Usado - Buen estado', 'Nintendo', 'Cartucho y manual', 'games/zelda-link-to-past.jpg', '2025-04-11 16:54:03', '2025-04-11 16:54:03'),
(7, 3, 'Mario 64', 'mario-64', 'El primer Mario en 3D. Una revolución en los juegos de plataformas.', 79.99, NULL, 8, 1996, 'Usado - Buen estado', 'Nintendo', 'Cartucho y caja', 'games/mario64.jpg', '2025-04-11 16:54:12', '2025-04-11 16:54:12'),
(8, 3, 'Mario Kart 64', 'mario-kart-64', 'Compite con tus personajes favoritos de Nintendo en emocionantes carreras.', 69.99, NULL, 5, 1996, 'Usado - Buen estado', 'Nintendo', 'Solo cartucho', 'games/mario-kart-64.jpg', '2025-04-11 16:54:12', '2025-04-11 16:54:12'),
(9, 3, 'The Legend of Zelda: Ocarina of Time', 'zelda-ocarina-of-time', 'Considerado por muchos como el mejor juego de la historia. Acompaña a Link en su viaje por el tiempo.', 99.99, 89.99, 0, 1998, 'Coleccionista', 'Nintendo', 'Cartucho, caja y manual', 'games/zelda-ocarina.jpg', '2025-04-11 16:54:12', '2025-05-28 14:28:20'),
(10, 3, 'Paper Mario', 'paper-mario', 'Una aventura RPG donde Mario y sus amigos están hechos de papel.', 74.99, NULL, 4, 2000, 'Usado - Buen estado', 'Nintendo', 'Cartucho y manual', 'games/paper-mario.jpg', '2025-04-11 16:54:12', '2025-04-11 16:54:12'),
(15, 30, 'Aladdinsega', 'aladdin', 'El juego esta en un estado impecable', 120.00, NULL, 0, 1988, 'Coleccionista', 'sega', 'Incluye cartucho, caja y manual', 'games/hY4aL6JQZly6IAvKpZyiJppGnnOim8PIOExMarac.jpg', '2025-05-25 11:45:18', '2025-05-29 01:00:38'),
(12, 4, 'Metal Gear Solid', 'metal-gear-solid', 'El clásico de sigilo de Hideo Kojima. Controla a Solid Snake en su misión en Shadow Moses.', 79.99, NULL, 4, 1998, 'Coleccionista', 'Konami', 'Disco, caja y manual', 'games/mgs.jpg', '2025-04-11 16:54:20', '2025-04-11 16:54:20'),
(13, 4, 'Crash Bandicoot', 'crash-bandicoot', 'El icónico marsupial naranja en su primera aventura de plataformas.', 49.99, 39.99, 7, 1996, 'Usado - Buen estado', 'Naughty Dog', 'Disco y caja', 'games/crash.jpg', '2025-04-11 16:54:20', '2025-04-11 16:54:20'),
(16, 30, 'After Burner', 'after-burner', 'juego en buen estado', 60.00, NULL, 2, 1985, 'Usado - Buen estado', 'sega', 'cartucho', 'games/ZZXQBVKYwubybFdIseAmWIrYagX7yEREbMjKvEXx.jpg', '2025-05-28 21:15:07', '2025-05-28 21:15:07'),
(17, 6, 'aladdin 2', 'aladdin-2', 'aladdin que te vi', 20.00, NULL, 1, 1999, 'Coleccionista', 'disney', 'completo', 'games/0JfzkVUSmwGlNPRmt5VEQLGBghCDlSIdgHqznGGp.jpg', '2025-05-28 21:34:19', '2025-05-28 21:34:19'),
(18, 6, 'Aladdin', 'aladdin-mega', 'Considerado uno de los mejores juegos basados en películas de Disney, Aladdin ofrece una experiencia visual brillante con animaciones diseñadas por Disney. Acompaña a Aladdin en su aventura por Agrabah enfrentando guardias, explorando el desierto y sobreviviendo a la Cueva de las Maravillas.', 29.99, NULL, 10, 1993, 'Usado - Muy bueno', 'Virgin Games / SEGA', 'Cartucho original', 'games/aladdin.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(19, 6, 'Alien Soldier', 'alien-soldier', 'Shooter frenético de Treasure con gráficos impresionantes y combates contra jefes desafiantes. Juegas como Epsilon-Eagle, un super-soldado con habilidades únicas. Sistema de armas múltiples y dificultad elevada.', 49.99, NULL, 5, 1995, 'Usado - Excelente', 'Treasure / SEGA', 'Cartucho original', 'games/alien_soldier.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(20, 6, 'Battletoads', 'battletoads', 'Combina lucha, plataformas y conducción en una aventura brutalmente difícil. Controla a los carismáticos sapos Zitz, Rash y Pimple en niveles llenos de acción, velocidad y humor.', 39.99, NULL, 4, 1993, 'Usado - Bueno', 'Rare / Tradewest', 'Cartucho', 'games/battletoads.jpg', '2025-05-29 01:02:13', '2025-05-29 01:19:02'),
(21, 6, 'Beyond Oasis', 'beyond-oasis', 'Aventura y acción en un mundo fantástico. Controlas a Ali, un joven que encuentra un brazalete mágico con el que invoca espíritus elementales. Gran apartado gráfico y jugabilidad con mecánicas únicas.', 44.99, NULL, 3, 1994, 'Usado - Bueno', 'Ancient / SEGA', 'Cartucho', 'games/beyond_oasis.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(22, 6, 'Castlevania: Bloodlines', 'castlevania-bloodlines', 'Una entrega exclusiva de Mega Drive, con gráficos sangrientos y acción trepidante. Juega como John Morris o Eric Lecarde enfrentando criaturas del mal en un tour por Europa.', 69.99, NULL, 2, 1994, 'Usado - Excelente', 'Konami', 'Cartucho', 'games/castlevania_bloodlines.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(23, 6, 'Columns', 'columns', 'Clásico juego tipo puzzle donde alineas gemas del mismo color para hacerlas desaparecer. Ideal para partidas rápidas, con modo arcade y música relajante.', 19.99, NULL, 6, 1990, 'Usado - Bueno', 'SEGA', 'Cartucho', 'games/columns.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(24, 6, 'Comix Zone', 'comix-zone', 'Juego beat’em up ambientado dentro de un cómic interactivo. Excelente animación, narrativa creativa y combates intensos. Eres un dibujante atrapado en su propia creación.', 39.99, NULL, 4, 1995, 'Usado - Muy bueno', 'SEGA Technical Institute', 'Cartucho', 'games/comix_zone.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(25, 6, 'Contra: Hard Corps', 'contra-hard-corps', 'Shooter 2D de acción frenética y dificultad legendaria. Gráficos impactantes, múltiples personajes, rutas y finales alternativos. Uno de los mejores Contra.', 59.99, NULL, 2, 1994, 'Coleccionista', 'Konami', 'Cartucho', 'games/contra_hard_corps.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(26, 6, 'Decap Attack', 'decap-attack', 'Plataformas bizarro protagonizado por Chuck D. Head, una criatura que lanza su cabeza. Humor negro y estética única con mecánicas divertidas.', 34.99, NULL, 3, 1991, 'Usado - Bueno', 'Vic Tokai', 'Cartucho', 'games/decap_attack.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(27, 6, 'Dr. RobotniksMean Bean Machine', 'dr-robotniks-mean-bean-machine', 'Consola: SEGA Mega Drive\r\n\r\nAño: 1993\r\n\r\nGénero: Puzzle\r\n\r\nDescripción: Inspirado en la saga Puyo Puyo, este juego de puzles con estética Sonic enfrenta al jugador contra los secuaces del Dr. Robotnik. Encadena frijoles del mismo color para atacar al enemigo. Divertido, competitivo y con una excelente curva de dificultad.', 24.99, NULL, 5, 1993, 'Usado - Bueno', 'Compile / SEGA', 'Cartucho', 'games/mean_bean_machine.jpg', '2025-05-29 01:02:13', '2025-05-29 01:24:12'),
(28, 6, 'Dynamite Headdy', 'dynamite-headdy', 'Colorido juego de plataformas protagonizado por un muñeco con cabeza intercambiable. Animaciones fluidas, estilo teatral y gran diseño de niveles.', 39.99, NULL, 4, 1994, 'Usado - Muy bueno', 'Treasure / SEGA', 'Cartucho', 'games/dynamite_headdy.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(29, 6, 'Jungle Strike', 'jungle-strike', 'Secuela de Desert Strike con misiones aéreas tácticas. Controlas un helicóptero en operaciones contra el terrorismo. Estrategia, acción y dificultad progresiva.', 29.99, NULL, 6, 1993, 'Usado - Bueno', 'Electronic Arts', 'Cartucho', 'games/jungle_strike.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(30, 6, 'Herzog Zwei', 'herzog-zwei', 'Pionero de los RTS en consola. Controlas un mecha que gestiona unidades en tiempo real. Muy avanzado para su época, con jugabilidad táctica intensa.', 54.99, NULL, 2, 1989, 'Coleccionista', 'Technosoft / SEGA', 'Cartucho', 'games/herzog_zwei.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(31, 6, 'Gunstar Heroes', 'gunstar-heroes', 'Run & gun cooperativo con animaciones espectaculares y gran variedad de armas. Una obra maestra de Treasure con combates caóticos y niveles inolvidables.', 59.99, NULL, 4, 1993, 'Usado - Excelente', 'Treasure / SEGA', 'Cartucho', 'games/gunstar_heroes.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(32, 6, 'Golden Axe II', 'golden-axe-2', 'Hack and slash de fantasía heroica. Elige entre tres guerreros para enfrentar al malvado Dark Guld. Acción cooperativa y hechizos devastadores.', 34.99, NULL, 5, 1991, 'Usado - Bueno', 'SEGA', 'Cartucho', 'games/golden_axe_2.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(33, 6, 'Flashback', 'flashback', 'Cinemática aventura de plataformas con animaciones tipo rotoscopía. El protagonista debe recuperar su memoria en un mundo futurista lleno de peligros.', 44.99, NULL, 3, 1993, 'Usado - Muy bueno', 'Delphine Software', 'Cartucho', 'games/flashback.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(34, 6, 'Ecco the Dolphin', 'ecco-the-dolphin', 'Exploración y puzles submarinos protagonizados por un delfín. Atmósfera melancólica, física acuática y banda sonora ambiental inolvidable.', 24.99, NULL, 6, 1992, 'Usado - Bueno', 'Appaloosa / SEGA', 'Cartucho', 'games/ecco_dolphin.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(35, 6, 'Earthworm Jim', 'earthworm-jim', 'Plataformas hilarante con un gusano superhéroe como protagonista. Humor absurdo, animación brillante y niveles variados y creativos.', 39.99, NULL, 5, 1994, 'Usado - Muy bueno', 'Shiny Entertainment / Playmates', 'Cartucho', 'games/earthworm_jim.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36'),
(36, 6, 'Landstalker', 'landstalker', 'Aventura isométrica de acción-RPG con exploración de mazmorras, puzles y narrativa envolvente. Controlas a Nigel, un cazatesoros en busca de riquezas.', 49.99, NULL, 3, 1992, 'Usado - Bueno', 'Climax Entertainment / SEGA', 'Cartucho', 'games/landstalker.jpg', '2025-05-29 01:02:13', '2025-05-29 01:18:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `game_category`
--

CREATE TABLE `game_category` (
  `game_id` int NOT NULL,
  `category_id` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `game_category`
--

INSERT INTO `game_category` (`game_id`, `category_id`) VALUES
(7, 3),
(8, 5),
(12, 2),
(12, 3),
(13, 3),
(16, 2),
(17, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `game_images`
--

CREATE TABLE `game_images` (
  `id` int NOT NULL,
  `game_id` int NOT NULL,
  `image_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `jobs`
--

INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
(5, 'default', '{\"uuid\":\"d6036ca8-e09d-4bc4-a7e6-81422af9bc11\",\"displayName\":\"App\\\\Mail\\\\OrderConfirmation\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Mail\\\\SendQueuedMailable\",\"command\":\"O:34:\\\"Illuminate\\\\Mail\\\\SendQueuedMailable\\\":15:{s:8:\\\"mailable\\\";O:26:\\\"App\\\\Mail\\\\OrderConfirmation\\\":3:{s:5:\\\"order\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:16:\\\"App\\\\Models\\\\Order\\\";s:2:\\\"id\\\";i:13;s:9:\\\"relations\\\";a:4:{i:0;s:4:\\\"user\\\";i:1;s:5:\\\"items\\\";i:2;s:10:\\\"items.game\\\";i:3;s:18:\\\"items.game.console\\\";}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}s:2:\\\"to\\\";a:1:{i:0;a:2:{s:4:\\\"name\\\";N;s:7:\\\"address\\\";s:15:\\\"admin@gmail.com\\\";}}s:6:\\\"mailer\\\";s:4:\\\"smtp\\\";}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:13:\\\"maxExceptions\\\";N;s:17:\\\"shouldBeEncrypted\\\";b:0;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;s:3:\\\"job\\\";N;}\"}}', 0, NULL, 1748452348, 1748452348);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_03_31_131644_create_personal_access_tokens_table', 1),
(5, '2025_05_27_add_indexes_to_orders_tables', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `payment_method` enum('stripe','paypal') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tracking_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_carrier` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shipping_status` enum('pending','preparing','shipped','in_transit','delivered','returned') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `shipping_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total`, `status`, `payment_method`, `payment_id`, `shipping_address`, `tracking_number`, `shipping_carrier`, `shipping_status`, `shipped_at`, `delivered_at`, `shipping_notes`, `created_at`, `updated_at`) VALUES
(4, 2, 120.00, 'completed', 'paypal', 'PAYPAL_6836f1ace35be', '\"[]\"', 'TEST123456', 'Correos', 'in_transit', '2025-05-28 15:24:05', NULL, NULL, '2025-05-28 11:21:20', '2025-05-28 15:24:05'),
(5, 2, 89.99, 'completed', 'stripe', 'pi_development_683714844aaa0', '\"{\\\"address\\\":\\\"calle santo domingo N\\\\u00ba12 bloq 1 2H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"678012920\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 13:49:58', '2025-05-28 13:49:58'),
(3, 2, 120.00, 'completed', 'stripe', 'pi_development_6836eedcf113f', '\"{\\\"address\\\":\\\"calle santo domingo N\\\\u00ba12 bloq 1 2H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"678012920\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 11:09:19', '2025-05-28 11:09:19'),
(6, 2, 89.99, 'completed', 'paypal', 'PAYPAL_6837157bb40b5', '\"[]\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 13:54:07', '2025-05-28 13:54:07'),
(7, 2, 120.00, 'completed', 'stripe', 'pi_development_683715d4a526f', '\"{\\\"address\\\":\\\"calle santo domingo N\\\\u00ba12 bloq 1 2H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"678012920\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 13:55:35', '2025-05-28 13:55:35'),
(8, 2, 49.99, 'completed', 'stripe', 'pi_development_68371723ae697', '\"{\\\"address\\\":\\\"calle santo domingo N\\\\u00ba12 bloq 1 2H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"678012920\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 14:01:10', '2025-05-28 14:01:10'),
(9, 2, 89.99, 'completed', 'stripe', 'pi_development_68371d81d1b11', '\"{\\\"address\\\":\\\"calle santo domingo N\\\\u00ba12 bloq 1 2H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"678012920\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 14:28:20', '2025-05-28 14:28:20'),
(10, 2, 49.99, 'completed', 'stripe', 'pi_development_68371e886f3a1', '\"{\\\"address\\\":\\\"calle santo domingo N\\\\u00ba12 bloq 1 2H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"678012920\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 14:32:42', '2025-05-28 14:32:42'),
(11, 2, 120.00, 'completed', 'paypal', 'PAYPAL_6837202cd7f33', '\"[]\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 14:39:44', '2025-05-28 14:39:44'),
(12, 2, 120.00, 'completed', 'paypal', 'PAYPAL_683721cc64211', '\"[]\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 14:46:39', '2025-05-28 14:46:39'),
(13, 5, 49.99, 'completed', 'stripe', 'pi_development_683743fa29945', '\"{\\\"address\\\":\\\"domingo N\\\\u00ba12 bloq 1 3H\\\",\\\"city\\\":\\\"jerez de la frontera\\\",\\\"postalCode\\\":\\\"11402\\\",\\\"country\\\":\\\"Espa\\\\u00f1a\\\",\\\"phone\\\":\\\"657201245\\\"}\"', NULL, NULL, 'pending', NULL, NULL, NULL, '2025-05-28 17:12:28', '2025-05-28 17:12:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint UNSIGNED NOT NULL,
  `order_id` int NOT NULL,
  `game_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `game_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(4, 4, 15, 1, 120.00, '2025-05-28 11:21:20', '2025-05-28 11:21:20'),
(3, 3, 15, 1, 120.00, '2025-05-28 11:09:19', '2025-05-28 11:09:19'),
(5, 5, 9, 1, 89.99, '2025-05-28 13:49:58', '2025-05-28 13:49:58'),
(6, 6, 9, 1, 89.99, '2025-05-28 13:54:07', '2025-05-28 13:54:07'),
(7, 7, 15, 1, 120.00, '2025-05-28 13:55:35', '2025-05-28 13:55:35'),
(8, 8, 1, 1, 49.99, '2025-05-28 14:01:10', '2025-05-28 14:01:10'),
(9, 9, 9, 1, 89.99, '2025-05-28 14:28:20', '2025-05-28 14:28:20'),
(10, 10, 1, 1, 49.99, '2025-05-28 14:32:42', '2025-05-28 14:32:42'),
(11, 11, 15, 1, 120.00, '2025-05-28 14:39:44', '2025-05-28 14:39:44'),
(12, 12, 15, 1, 120.00, '2025-05-28 14:46:39', '2025-05-28 14:46:39'),
(13, 13, 1, 1, 49.99, '2025-05-28 17:12:28', '2025-05-28 17:12:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(33, 'App\\Models\\User', 3, 'auth_token', '4d0f586e05cb6f839eac344586e199acab915ec70bb2668583c85fbb111757d7', '[\"*\"]', '2025-05-21 00:58:38', NULL, '2025-05-21 00:58:37', '2025-05-21 00:58:38'),
(34, 'App\\Models\\User', 3, 'auth_token', 'c6065739d5e0f0b7344ffe75db51cd0ade2950d3964d497bc1c117a4f3dddc82', '[\"*\"]', NULL, NULL, '2025-05-21 00:59:03', '2025-05-21 00:59:03'),
(35, 'App\\Models\\User', 3, 'auth_token', 'b997a13a2e94ee2f5d32757060a7205be68e2381f2c6fbdb2a3ff7a385d307b6', '[\"*\"]', NULL, NULL, '2025-05-21 00:59:12', '2025-05-21 00:59:12'),
(36, 'App\\Models\\User', 3, 'auth_token', 'ec6a411134331818e0523f36f053006ada0e2bc912a58652782858f2f4ff796e', '[\"*\"]', NULL, NULL, '2025-05-21 00:59:14', '2025-05-21 00:59:14'),
(37, 'App\\Models\\User', 3, 'auth_token', '1918ed85ac76c7ae405c34c743fa8434f9c1953982c5bd9bf70a29a6c9363579', '[\"*\"]', NULL, NULL, '2025-05-21 00:59:15', '2025-05-21 00:59:15'),
(38, 'App\\Models\\User', 3, 'auth_token', '18782f6564793b2cc91dad2fe03338227d65bfe95dfb24498dd02bf3af6c136e', '[\"*\"]', '2025-05-21 01:01:03', NULL, '2025-05-21 00:59:16', '2025-05-21 01:01:03'),
(46, 'App\\Models\\User', 3, 'auth_token', '83bc87a0cf700877a20d428a70980d19c5dc45d4839d5c24fd64d16b1e82fae7', '[\"*\"]', '2025-05-21 01:15:52', NULL, '2025-05-21 01:11:48', '2025-05-21 01:15:52'),
(74, 'App\\Models\\User', 3, 'auth_token', 'be338c44a0a7da8823084f845367300cdf16d2c2f975d409bd23926b620f9622', '[\"*\"]', '2025-05-23 02:05:14', NULL, '2025-05-23 02:05:09', '2025-05-23 02:05:14'),
(171, 'App\\Models\\User', 2, 'auth_token', '47b452ef6a1fd514974f563a23b393def5ed32c8b6fd02fbf9213a29eba8b2fd', '[\"*\"]', '2025-05-29 02:11:47', NULL, '2025-05-29 02:00:55', '2025-05-29 02:11:47'),
(129, 'App\\Models\\User', 5, 'auth_token', '3186ab4c45f3ff48b502ea59663483dad04a93e0b18a68832960a935e487011d', '[\"*\"]', '2025-05-25 23:02:26', NULL, '2025-05-25 20:20:06', '2025-05-25 23:02:26'),
(123, 'App\\Models\\User', 5, 'auth_token', '9d9ad7a4fe1d60756c837246515c58f3d3bdacf491b0f73c1488c8c386499285', '[\"*\"]', '2025-05-25 17:48:20', NULL, '2025-05-25 17:41:42', '2025-05-25 17:48:20'),
(122, 'App\\Models\\User', 5, 'auth_token', '71ce05d5efb2973f9c026109057ea0012b303121c6a270051c5fb81dc0c22e9c', '[\"*\"]', '2025-05-25 17:41:04', NULL, '2025-05-25 17:40:54', '2025-05-25 17:41:04'),
(169, 'App\\Models\\User', 5, 'auth_token', '556b0ba7d0a394e8f134e675d419b46dc488a1074dd79d9f343231689e6a94aa', '[\"*\"]', '2025-05-29 01:55:54', NULL, '2025-05-28 23:55:11', '2025-05-29 01:55:54'),
(120, 'App\\Models\\User', 5, 'auth_token', '7c7d220328f296944c468ac1b93dd2c434e598dca3cf18f4eb108374d84c5665', '[\"*\"]', '2025-05-25 17:29:49', NULL, '2025-05-25 17:29:28', '2025-05-25 17:29:49'),
(121, 'App\\Models\\User', 5, 'auth_token', 'fba83e75e63d0706d4b3032d4de38ed6d27b9a865989fc090bf5125da9096a87', '[\"*\"]', '2025-05-25 17:33:18', NULL, '2025-05-25 17:30:38', '2025-05-25 17:33:18'),
(170, 'App\\Models\\User', 5, 'auth_token', 'af92eda34466726ba8d4d361ed7146ffc2abd45a191ca541738fbff1a85f22c3', '[\"*\"]', '2025-05-29 01:59:33', NULL, '2025-05-29 01:58:16', '2025-05-29 01:59:33'),
(118, 'App\\Models\\User', 5, 'auth_token', '216a989cd1d757f412dba7d5dccf76ae265b34eb9199f26fe2875eda7e859e71', '[\"*\"]', '2025-05-25 17:11:02', NULL, '2025-05-25 17:10:19', '2025-05-25 17:11:02'),
(168, 'App\\Models\\User', 5, 'auth_token', '0614b158f4b174110d7666ac8d4abdb0b87f7aa354c4e2b79b03159cd32ef7cd', '[\"*\"]', '2025-05-28 22:49:12', NULL, '2025-05-28 21:38:26', '2025-05-28 22:49:12'),
(167, 'App\\Models\\User', 5, 'auth_token', '03e0a9a76f11be53d17c2f349645fc4138b004f9819e72a8c6fb5207872d8a53', '[\"*\"]', '2025-05-28 21:34:19', NULL, '2025-05-28 20:31:35', '2025-05-28 21:34:19'),
(160, 'App\\Models\\User', 2, 'auth_token', 'f2e69456e884c47fe0f05c09f8251d6246be21484f770fe3eec83829697c22b7', '[\"*\"]', '2025-05-28 12:15:51', NULL, '2025-05-28 06:51:24', '2025-05-28 12:15:51'),
(113, 'App\\Models\\User', 5, 'auth_token', '2f4647de31e459226dcf1e3a0977a773c70b8736c58763adb42f4898dee0877b', '[\"*\"]', '2025-05-25 16:46:14', NULL, '2025-05-25 16:46:10', '2025-05-25 16:46:14'),
(159, 'App\\Models\\User', 2, 'auth_token', 'ab04776d941115c8aabbe531aa3468b880c382002c5e16967761633243b2a3ab', '[\"*\"]', '2025-05-27 23:09:19', NULL, '2025-05-27 23:08:39', '2025-05-27 23:09:19'),
(158, 'App\\Models\\User', 2, 'auth_token', '1fb75701718e1245eabaf8034bba4d152bc1b9bff7a26b27c93be6c6ca19e3b6', '[\"*\"]', '2025-05-27 22:39:31', NULL, '2025-05-27 21:06:15', '2025-05-27 22:39:31'),
(110, 'App\\Models\\User', 5, 'auth_token', 'de1b996862e1974b30aa4f0d9c2adbba5c440865b56c48345b0425ef5dd3a2a5', '[\"*\"]', '2025-05-25 16:43:01', NULL, '2025-05-25 16:42:54', '2025-05-25 16:43:01'),
(148, 'App\\Models\\User', 2, 'auth_token', '3d019a97f1f91fa2076e01131909e5b61bd3c5ef36913391e20793cb08e6ac7e', '[\"*\"]', '2025-05-27 13:26:27', NULL, '2025-05-27 12:38:52', '2025-05-27 13:26:27'),
(109, 'App\\Models\\User', 5, 'auth_token_172.18.0.1_1748190787', '5f6f6694758f09d80356ef75e88f854c0b7033997e91036c6646f4638c490026', '[\"*\"]', '2025-05-25 16:33:10', NULL, '2025-05-25 16:33:07', '2025-05-25 16:33:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reviews`
--

CREATE TABLE `reviews` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` tinyint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_verified_purchase` tinyint(1) DEFAULT '0',
  `helpful_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review_votes`
--

CREATE TABLE `review_votes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `review_id` int NOT NULL,
  `is_helpful` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `vote` tinyint(1) NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'admin', '2025-03-31 14:29:42', '2025-03-31 14:29:42'),
(2, 'usuarios', '2025-03-31 14:29:43', '2025-05-14 16:46:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `notifications_offers` tinyint(1) DEFAULT '1',
  `notifications_products` tinyint(1) DEFAULT '0',
  `notifications_orders` tinyint(1) DEFAULT '1',
  `notifications_newsletter` tinyint(1) DEFAULT '0',
  `privacy_public_profile` tinyint(1) DEFAULT '0',
  `privacy_wishlist` tinyint(1) DEFAULT '0',
  `privacy_purchase_history` tinyint(1) DEFAULT '0',
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int DEFAULT '2',
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `city`, `postal_code`, `country`, `birth_date`, `notifications_offers`, `notifications_products`, `notifications_orders`, `notifications_newsletter`, `privacy_public_profile`, `privacy_wishlist`, `privacy_purchase_history`, `two_factor_enabled`, `two_factor_secret`, `password`, `role_id`, `remember_token`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(2, 'santiago garcia guzman', 'santi-91@alumnos.alborfp.com', '678012920', 'calle santo domingo Nº12 bloq 1 2H', 'jerez de la frontera', '11402', 'España', '1990-11-07', 1, 0, 1, 0, 0, 0, 0, 0, NULL, '$2y$12$ddqNS7pt9qwBoDFtXkcQaOZbr3kK0QmoNBxIofa7GpHkFOmIcaXFy', 2, NULL, NULL, '2025-05-14 16:49:56', '2025-05-28 13:52:56'),
(3, 'prueba', 'prueba@gmil.com', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 1, 0, 0, 0, 0, 0, NULL, '$2y$12$2VzZCS4FGx8cAro1chnXkei4LgZxHjsBi1dsrmJJbCYhpl1tH4CbO', 2, NULL, NULL, '2025-05-21 00:58:37', '2025-05-25 22:38:33'),
(5, 'admin', 'admin@gmail.com', '657201245', 'domingo Nº12 bloq 1 3H', 'jerez de la frontera', '11402', 'España', NULL, 1, 0, 1, 0, 0, 0, 0, 0, NULL, '$2y$12$aJpkf3poyYyOU81BwYAROe.ZtYHQvL8VgSKjhA47oFKIVtvyYDZ3.', 1, NULL, NULL, '2025-05-24 03:17:39', '2025-05-28 17:12:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `wishlist_items`
--

INSERT INTO `wishlist_items` (`id`, `user_id`, `game_id`, `created_at`, `updated_at`) VALUES
(29, 2, 9, '2025-05-25 14:01:32', '2025-05-25 14:01:32'),
(28, 2, 2, '2025-05-25 14:01:32', '2025-05-25 14:01:32'),
(27, 2, 1, '2025-05-25 14:01:31', '2025-05-25 14:01:31'),
(31, 5, 17, '2025-05-28 21:38:38', '2025-05-28 21:38:38');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_game_unique` (`user_id`,`game_id`),
  ADD KEY `cart_items_user_id_game_id_index` (`user_id`,`game_id`);

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_slug` (`slug`);

--
-- Indices de la tabla `consoles`
--
ALTER TABLE `consoles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_slug` (`slug`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_slug` (`slug`(191)),
  ADD KEY `console_id` (`console_id`);

--
-- Indices de la tabla `game_category`
--
ALTER TABLE `game_category`
  ADD PRIMARY KEY (`game_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indices de la tabla `game_images`
--
ALTER TABLE `game_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `orders_user_id_index` (`user_id`),
  ADD KEY `orders_status_index` (`status`),
  ADD KEY `orders_payment_method_index` (`payment_method`),
  ADD KEY `orders_created_at_index` (`created_at`),
  ADD KEY `tracking_number_index` (`tracking_number`);

--
-- Indices de la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `game_id` (`game_id`),
  ADD KEY `order_items_order_id_index` (`order_id`),
  ADD KEY `order_items_game_id_index` (`game_id`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_token` (`token`),
  ADD KEY `tokenable_type_id` (`tokenable_type`(191),`tokenable_id`);

--
-- Indices de la tabla `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_game_order` (`user_id`,`game_id`,`order_id`),
  ADD KEY `reviews_user_id_index` (`user_id`),
  ADD KEY `reviews_game_id_index` (`game_id`),
  ADD KEY `reviews_order_id_index` (`order_id`),
  ADD KEY `reviews_rating_index` (`rating`);

--
-- Indices de la tabla `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_review` (`user_id`,`review_id`),
  ADD KEY `review_votes_review_id_index` (`review_id`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_email` (`email`(191)),
  ADD KEY `role_id` (`role_id`);

--
-- Indices de la tabla `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist_item` (`user_id`,`game_id`),
  ADD KEY `game_id` (`game_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `consoles`
--
ALTER TABLE `consoles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `games`
--
ALTER TABLE `games`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `game_images`
--
ALTER TABLE `game_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=172;

--
-- AUTO_INCREMENT de la tabla `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `review_votes`
--
ALTER TABLE `review_votes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
