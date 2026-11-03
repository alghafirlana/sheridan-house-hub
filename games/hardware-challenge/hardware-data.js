/** Hardware Challenge question bank. Images are geometry-only crops of the
 * professor's original photographs — no AI-redrawn chips or invented labels.
 * Hotspots are polygon points in the ORIGINAL CROPPED IMAGE PIXEL COORDINATES.
 * To add hardware later, add an item here and its matching photo in assets/.
 * To change the number of leaderboard-scored levels for a NEW event, edit the
 * ONLY scoring count in js/config.js, then regenerate + publish Firestore rules.
 */
const p = (id, label, question, fact, points) => ({ id, label, question, fact, points });
export const HARDWARE_LEVELS = [
  {
    id: 1, title: "Motherboard Explorer", subtitle: "ASUS motherboard · 2 RAM slots",
    description: "Find the essential sockets, slots and connectors on this motherboard.",
    image: "assets/asus-two-slots.jpg", width: 1247, height: 1065,
    availability: "photo", enabled: true, questionsPerRound: 4,
    targets: [
      p("cpu", "CPU socket", "Tap the CPU socket.", "This socket holds the processor. The processor is not installed in this photo.", [[340,654],[639,658],[641,965],[332,969]]),
      p("ram", "RAM slots", "Find the two long RAM slots.", "RAM modules slide into memory slots so the computer can access working data quickly.", [[145,356],[283,354],[279,1064],[143,1064]]),
      p("battery", "CMOS battery", "Find the round CMOS battery.", "The coin-cell battery helps maintain settings and the clock when power is disconnected.", [[469,171],[574,168],[582,277],[474,280]]),
      p("sata", "SATA ports", "Find the group of blue SATA ports.", "SATA ports connect compatible storage devices such as hard drives and SSDs.", [[140,32],[311,36],[307,164],[137,164]]),
      p("atx", "24-pin power connector", "Find the long blue motherboard power connector.", "This connector brings power from the computer's power supply to the motherboard.", [[62,468],[140,468],[133,705],[57,709]]),
      p("heatsink", "Chipset heatsink", "Tap the blue heatsink near the middle of the board.", "A heatsink moves heat away from a chip to help keep it cool.", [[468,359],[707,358],[714,533],[466,537]]),
    ],
  },
  {
    id: 2, title: "Memory & Expansion", subtitle: "ASUS motherboard · 4 RAM slots",
    description: "Explore a different board layout with more memory and expansion options.",
    image: "assets/asus-four-slots.jpg", width: 1247, height: 1025,
    availability: "photo", enabled: true, questionsPerRound: 4,
    targets: [
      p("cpu", "CPU socket", "Find the empty CPU socket.", "The CPU socket holds a compatible processor; this one is currently empty.", [[250,391],[528,391],[532,650],[248,650]]),
      p("ram", "RAM slots", "Tap the four long memory slots.", "These four DIMM slots are where compatible RAM modules are installed.", [[91,198],[716,198],[719,326],[89,328]]),
      p("battery", "CMOS battery", "Tap the round silver CMOS battery.", "The CMOS battery helps preserve some motherboard settings and timekeeping.", [[868,85],[978,86],[982,205],[871,205]]),
      p("sata", "SATA connectors", "Find the group of blue SATA connectors on the right.", "SATA ports connect compatible storage drives to the motherboard.", [[1015,49],[1130,47],[1127,267],[1012,270]]),
      p("power", "24-pin ATX power", "Find the large blue 24-pin ATX power connector.", "The main ATX connector supplies power from the computer's power supply.", [[520,39],[753,39],[752,107],[522,108]]),
      p("heatsink", "ASUS heatsink", "Find the large blue ASUS heatsink beside the CPU socket.", "Heatsinks draw heat from chips and help prevent overheating.", [[674,298],[832,299],[836,658],[676,657]]),
    ],
  },
  {
    id: 3, title: "Dell Component Lab", subtitle: "Dell motherboard · CPU installed",
    description: "Identify an installed processor, memory and expansion connectors.",
    image: "assets/dell-motherboard.jpg", width: 960, height: 870,
    availability: "photo", enabled: true, questionsPerRound: 4,
    targets: [
      p("cpu", "Installed processor", "Tap the installed CPU.", "The CPU executes instructions. This processor is already seated in its socket.", [[449,579],[631,580],[631,771],[444,770]]),
      p("ram", "RAM slots", "Find the four long black memory slots.", "RAM slots hold memory modules used by programs while the computer is running.", [[204,394],[368,392],[369,832],[202,833]]),
      p("heatsink", "Chipset heatsink", "Tap the silver finned heatsink.", "The metal fins help dissipate heat from the chip beneath them.", [[449,305],[608,306],[608,415],[449,417]]),
      p("pcie", "Blue expansion slot", "Find the long blue expansion slot.", "PCI Express expansion slots let a computer add compatible cards.", [[698,246],[763,249],[766,566],[697,563]]),
      p("pci", "White PCI slots", "Find the two long white expansion slots.", "These older PCI slots are used for compatible legacy expansion cards.", [[764,229],[925,227],[928,518],[761,519]]),
      p("battery", "Coin-cell battery holder", "Find the round black battery holder.", "This holder is for the motherboard's CMOS/RTC coin-cell battery. It appears empty here.", [[590,245],[673,246],[674,328],[589,329]]),
    ],
  },
  {
    id: 4, title: "Wireless Connection", subtitle: "iMicro PCI Wi-Fi adapter",
    description: "Explore how an add-on wireless network adapter connects to a computer.",
    image: "assets/wifi-adapter.jpg", width: 1125, height: 685,
    availability: "photo", enabled: true, questionsPerRound: 3,
    targets: [
      p("antenna", "Wireless antenna", "Tap the long black wireless antenna.", "The antenna transmits and receives radio signals for the Wi-Fi adapter.", [[0,601],[36,585],[92,556],[169,519],[231,492],[286,465],[330,450],[346,470],[301,495],[248,522],[180,559],[109,597],[42,640],[0,656]]),
      p("contacts", "PCI edge connector", "Find the gold contacts along the edge of the card.", "These contacts insert into a compatible PCI slot on a motherboard.", [[583,498],[984,495],[983,541],[583,542]]),
      p("bracket", "Metal mounting bracket", "Tap the silver metal bracket.", "The bracket fastens the expansion card to a desktop computer case.", [[299,60],[365,49],[400,100],[411,620],[390,648],[372,615],[351,132],[290,119]]),
      p("chip", "Controller chip", "Find the black square controller chip on the green circuit board.", "A controller chip manages communication between the wireless adapter and the computer.", [[722,386],[819,387],[822,486],[719,486]]),
      p("shield", "Wireless module shield", "Tap the silver rectangular module shield.", "This metal cover protects and shields part of the wireless hardware.", [[519,381],[669,381],[670,492],[517,493]]),
    ],
  },
];
export const activeHardware = () => HARDWARE_LEVELS.filter(h => h.enabled);
export const getHardwareLevel = (id) => HARDWARE_LEVELS.find(h => h.id === Number(id));
