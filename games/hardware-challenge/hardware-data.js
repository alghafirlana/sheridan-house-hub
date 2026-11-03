/**
 * Hardware Challenge question bank.
 *
 * These four launch assets are the user-approved hc1.png–hc4.png images,
 * copied as-is. They are not the previous photo crops. Small AI-rendered
 * detail differences may exist versus the professor's original photos.
 *
 * Hotspot polygons use pixel coordinates in the APPROVED IMAGE ITSELF.
 * The SVG viewBox tracks image width/height, preserving hit alignment at
 * different screen sizes and zoom levels.
 *
 * displayRotation rotates the image AND its hotspots visually in the viewer,
 * without modifying the original image or hotspot coordinates. Use 0/90/180/270.
 * Add more hardware by adding an image and a level here. Set the number of
 * competitive levels for a NEW event once in ../../js/config.js.
 */
// Multiple disjoint polygons can belong to one answer (e.g. each RAM slot).
const p = (id, label, question, fact, geometry) => ({
  id,
  label,
  question,
  fact,
  regions: typeof geometry?.[0]?.[0] === "number" ? [geometry] : geometry,
});
const IMAGE_WIDTH = 1122;
const IMAGE_HEIGHT = 1402;

export const HARDWARE_LEVELS = [
  {
    id: 1,
    title: "Motherboard Explorer",
    subtitle: "ASUS motherboard · 2 RAM slots",
    description:
      "Find the essential sockets, slots and connectors on this ASUS motherboard.",
    image: "assets/hc2.png",
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    displayRotation: 90,
    availability: "photo",
    enabled: true,
    questionsPerRound: 4,
    targets: [
      p(
        "cpu",
        "CPU socket",
        "Tap the CPU socket.",
        "This is where the processor is installed. The socket in this photo is empty.",
        [
          [346, 807],
          [630, 805],
          [631, 1055],
          [345, 1055],
        ],
      ),
      p(
        "ram",
        "RAM slots",
        "Find the two long blue RAM slots.",
        "RAM slots hold memory modules used by the computer while it is running.",
        [
          [
            [143, 538],
            [174, 537],
            [173, 1201],
            [175, 1240],
            [144, 1238],
          ],
          [
            [184, 538],
            [220, 538],
            [219, 1200],
            [221, 1240],
            [185, 1240],
          ],
        ],
      ),
      p(
        "battery",
        "CMOS battery",
        "Find the round silver CMOS battery.",
        "This coin-cell battery helps maintain the system clock and some motherboard settings.",
        [
          [468, 249],
          [528, 246],
          [555, 271],
          [561, 315],
          [543, 346],
          [493, 361],
          [458, 343],
          [448, 295],
        ],
      ),
      p(
        "sata",
        "SATA ports",
        "Find the group of four blue SATA ports.",
        "SATA connectors let compatible SSDs and hard drives communicate with the motherboard.",
        [
          [
            [58, 131],
            [136, 131],
            [137, 169],
            [57, 170],
          ],
          [
            [141, 131],
            [223, 131],
            [222, 170],
            [140, 171],
          ],
          [
            [58, 201],
            [138, 201],
            [137, 241],
            [58, 242],
          ],
          [
            [141, 202],
            [222, 202],
            [222, 240],
            [141, 241],
          ],
        ],
      ),
      p(
        "atx",
        "24-pin power connector",
        "Find the long blue motherboard power connector.",
        "The 24-pin ATX connector supplies main power to the motherboard.",
        [
          [44, 594],
          [107, 593],
          [108, 845],
          [46, 845],
        ],
      ),
      p(
        "heatsink",
        "Chipset heatsink",
        "Tap the large blue heatsink near the middle of the board.",
        "Heatsinks transfer heat away from chips to help prevent overheating.",
        [
          [389, 478],
          [433, 475],
          [440, 468],
          [638, 470],
          [637, 598],
          [710, 597],
          [708, 629],
          [389, 627],
        ],
      ),
    ],
  },
  {
    id: 2,
    title: "Memory & Expansion",
    subtitle: "ASUS motherboard · 4 RAM slots",
    description:
      "Explore an ASUS motherboard with more memory and expansion connections.",
    image: "assets/hc4.png",
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    displayRotation: 90,
    availability: "photo",
    enabled: true,
    questionsPerRound: 4,
    targets: [
      p(
        "cpu",
        "CPU socket",
        "Find the empty CPU socket.",
        "The CPU socket holds the processor; this one is currently empty.",
        [
          [253, 531],
          [455, 532],
          [455, 791],
          [252, 790],
        ],
      ),
      p(
        "ram",
        "RAM slots",
        "Tap the four long memory slots.",
        "Four RAM slots let this board hold multiple compatible memory modules.",
        [
          [
            [69, 295],
            [651, 295],
            [651, 329],
            [69, 330],
          ],
          [
            [69, 333],
            [651, 333],
            [651, 365],
            [69, 365],
          ],
          [
            [69, 371],
            [651, 370],
            [650, 407],
            [69, 407],
          ],
          [
            [69, 414],
            [651, 414],
            [651, 452],
            [69, 452],
          ],
        ],
      ),
      p(
        "battery",
        "CMOS battery",
        "Tap the round silver CMOS battery.",
        "The coin-cell battery helps preserve timekeeping and certain settings when unplugged.",
        [
          [845, 198],
          [895, 198],
          [924, 227],
          [926, 264],
          [900, 292],
          [852, 293],
          [820, 264],
          [821, 229],
        ],
      ),
      p(
        "sata",
        "SATA connectors",
        "Find the group of six blue SATA connectors.",
        "SATA ports connect compatible storage devices to the computer.",
        [
          [
            [963, 155],
            [1002, 156],
            [1002, 227],
            [963, 227],
          ],
          [
            [1027, 154],
            [1063, 155],
            [1063, 227],
            [1027, 227],
          ],
          [
            [964, 230],
            [1002, 230],
            [1002, 302],
            [963, 302],
          ],
          [
            [1028, 231],
            [1062, 231],
            [1063, 302],
            [1028, 302],
          ],
          [
            [963, 304],
            [1002, 304],
            [1002, 377],
            [963, 376],
          ],
          [
            [1028, 305],
            [1062, 305],
            [1062, 376],
            [1028, 377],
          ],
        ],
      ),
      p(
        "power",
        "24-pin ATX power",
        "Find the large blue 24-pin power connector.",
        "This main connector supplies power from the power supply to the motherboard.",
        [
          [456, 146],
          [681, 147],
          [681, 205],
          [455, 205],
        ],
      ),
      p(
        "heatsink",
        "ASUS heatsink",
        "Find the large blue ASUS heatsink beside the CPU socket.",
        "Its metal body and fins carry heat away from the chip underneath.",
        [
          [626, 464],
          [732, 465],
          [732, 535],
          [757, 550],
          [760, 792],
          [621, 793],
          [620, 546],
        ],
      ),
    ],
  },
  {
    id: 3,
    title: "Dell Component Lab",
    subtitle: "Dell motherboard · CPU installed",
    description:
      "Identify the processor, memory slots and expansion connectors.",
    image: "assets/hc3.png",
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    displayRotation: 90,
    availability: "photo",
    enabled: true,
    questionsPerRound: 4,
    targets: [
      p(
        "cpu",
        "Installed processor",
        "Tap the installed CPU.",
        "The CPU executes program instructions. This processor is installed in its socket.",
        [
          [482, 858],
          [624, 858],
          [625, 1014],
          [482, 1014],
        ],
      ),
      p(
        "ram",
        "RAM slots",
        "Find the four long black memory slots.",
        "These RAM slots hold the memory modules used by running programs.",
        [
          [
            [178, 603],
            [209, 603],
            [208, 1160],
            [208, 1187],
            [177, 1187],
          ],
          [
            [217, 604],
            [245, 603],
            [245, 1161],
            [245, 1187],
            [217, 1187],
          ],
          [
            [252, 605],
            [283, 604],
            [282, 1163],
            [283, 1187],
            [252, 1186],
          ],
          [
            [290, 604],
            [329, 603],
            [329, 1161],
            [326, 1187],
            [290, 1187],
          ],
        ],
      ),
      p(
        "heatsink",
        "Chipset heatsink",
        "Tap the silver finned heatsink.",
        "The metal fins help release heat from the chip beneath them.",
        [
          [443, 419],
          [574, 421],
          [575, 570],
          [442, 569],
        ],
      ),
      p(
        "pcie",
        "Blue expansion slot",
        "Find the long blue expansion slot.",
        "PCI Express expansion slots provide a way to add compatible expansion cards.",
        [
          [749, 323],
          [794, 324],
          [795, 667],
          [778, 710],
          [746, 711],
        ],
      ),
      p(
        "pci",
        "White PCI slots",
        "Find the two tall white expansion slots.",
        "Older PCI slots are designed for compatible legacy expansion cards.",
        [
          [
            [835, 295],
            [882, 294],
            [881, 638],
            [877, 639],
            [876, 709],
            [835, 710],
          ],
          [
            [919, 295],
            [969, 296],
            [969, 639],
            [954, 649],
            [920, 647],
          ],
        ],
      ),
      p(
        "battery",
        "Coin-cell battery holder",
        "Find the round black battery holder.",
        "This holder is for a motherboard's RTC/CMOS battery; it appears empty in this photo.",
        [
          [644, 343],
          [697, 337],
          [717, 370],
          [716, 415],
          [688, 445],
          [646, 449],
          [615, 416],
          [613, 371],
        ],
      ),
    ],
  },
  {
    id: 4,
    title: "Wireless Connection",
    subtitle: "iMicro PCI Wi-Fi adapter",
    defaultZoom: 1.5,
    description:
      "Discover how a wireless network adapter connects and receives signals.",
    image: "assets/hc1.png",
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    displayRotation: 0,
    availability: "photo",
    enabled: true,
    questionsPerRound: 3,
    targets: [
      p(
        "antenna",
        "Wireless antenna",
        "Tap the long black wireless antenna.",
        "This antenna sends and receives radio signals for the Wi-Fi adapter.",
        [
          [70, 923],
          [82, 906],
          [126, 882],
          [187, 849],
          [245, 821],
          [312, 788],
          [373, 762],
          [395, 759],
          [403, 773],
          [400, 792],
          [378, 799],
          [331, 818],
          [262, 852],
          [193, 885],
          [128, 923],
          [95, 947],
          [80, 955],
          [72, 946],
        ],
      ),
      p(
        "contacts",
        "PCI edge connector",
        "Find the gold contacts on the edge of the card.",
        "The gold contacts fit into a compatible PCI slot on a desktop motherboard.",
        [
          [
            [605, 807],
            [670, 806],
            [670, 832],
            [605, 834],
          ],
          [
            [678, 806],
            [872, 806],
            [872, 832],
            [678, 832],
          ],
          [
            [883, 806],
            [944, 805],
            [944, 833],
            [883, 833],
          ],
        ],
      ),
      p(
        "bracket",
        "Metal mounting bracket",
        "Tap the tall silver metal mounting bracket.",
        "The metal bracket secures the card to a desktop computer case.",
        [
          [361, 436],
          [418, 436],
          [426, 457],
          [407, 474],
          [422, 498],
          [437, 510],
          [437, 860],
          [431, 929],
          [417, 929],
          [413, 873],
          [412, 520],
          [395, 471],
          [358, 469],
        ],
      ),
      p(
        "chip",
        "Controller chip",
        "Find the black square controller chip.",
        "The controller chip handles communication between the adapter and the computer.",
        [
          [734, 707],
          [794, 706],
          [800, 769],
          [735, 769],
        ],
      ),
      p(
        "shield",
        "Wireless module shield",
        "Tap the silver rectangular module shield.",
        "This metal cover shields a section of the adapter's wireless circuitry.",
        [
          [550, 706],
          [665, 707],
          [664, 783],
          [549, 782],
        ],
      ),
    ],
  },
];

export const activeHardware = () => HARDWARE_LEVELS.filter((h) => h.enabled);
export const getHardwareLevel = (id) =>
  HARDWARE_LEVELS.find((h) => h.id === Number(id));
