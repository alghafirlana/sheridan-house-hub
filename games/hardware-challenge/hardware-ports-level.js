/**
 * Sheridan Hardware Challenge — Level 7: Ports & Connections
 * Original coordinate-first technical illustration.
 * Image and all target regions share the native 1448 × 1086 coordinate system.
 * See assets/hc7-source.svg and scripts/render-hardware-levels.py.
 * These are educational illustrations, not photographs of a specific product.
 * These optional levels do not change the active 5-level competitive roster.
 */
const p = (id, label, questions, fact, regions) => ({
  id,
  label,
  question: questions[0],
  questionVariants: questions,
  fact,
  regions,
});

export const PORTS_LEVEL = {
  id: 7,
  title: "Ports & Connections",
  subtitle: "Computer I/O \u00b7 connector identification",
  description: "Identify common ports by their shape and learn what each connector is for.",
  image: "assets/hc7.png",
  thumbnail: "assets/hc7-thumbnail.jpg",
  width: 1448,
  height: 1086,
  displayRotation: 0,
  availability: "digital",
  enabled: true,
  questionsPerRound: 6,
  targets: [
    p(
      "usb-a",
      "USB Type-A port",
      [
        "Find the rectangular USB Type-A receptacle with the blue plastic tongue.",
        "Tap the wide rectangular USB-A socket with a blue insert."
],
      "USB Type-A is a familiar rectangular USB connector. A blue insert often identifies certain SuperSpeed-capable ports, but color alone is not a universal specification.",
      [[[217,389],[361,389],[361,471],[217,471]]],
    ),
    p(
      "usb-c",
      "USB Type-C port",
      [
        "Find the small symmetrical oval-shaped USB-C receptacle.",
        "Tap the reversible USB Type-C connector."
],
      "USB-C describes the connector shape; supported data, display and charging features depend on the specific port.",
      [[[513,405],[652,405],[652,455],[513,455]]],
    ),
    p(
      "hdmi",
      "HDMI port",
      [
        "Find the trapezoid-shaped HDMI video connector.",
        "Tap the HDMI receptacle with the beveled sides."
],
      "A standard HDMI port is commonly used to carry digital video and audio to compatible displays.",
      [[[806,393],[935,393],[959,413],[951,465],[792,465],[783,413]]],
    ),
    p(
      "displayport",
      "DisplayPort connector",
      [
        "Find the rectangular digital display port with one clipped corner.",
        "Tap the DisplayPort receptacle with the angled corner."
],
      "DisplayPort is a digital display interface used to connect compatible monitors.",
      [[[1093,391],[1230,391],[1253,417],[1253,465],[1093,465]]],
    ),
    p(
      "ethernet",
      "Ethernet RJ45 jack",
      [
        "Find the wired-network jack with eight gold contacts.",
        "Tap the Ethernet port with a stepped opening."
],
      "An 8P8C modular jack, commonly called an RJ45 Ethernet port, connects compatible wired Ethernet cables.",
      [[[211,641],[354,641],[354,764],[332,764],[332,777],[233,777],[233,764],[211,764]]],
    ),
    p(
      "audio",
      "3.5 mm audio jack",
      [
        "Find the round 3.5 millimeter audio socket.",
        "Tap the circular audio connection."
],
      "A 3.5 mm jack can carry analog audio for headphones, microphones or a headset, depending on wiring.",
      [[[648,708],[647,721],[643,734],[637,745],[628,755],[618,764],[607,770],[594,774],[581,775],[568,774],[555,770],[544,764],[534,755],[525,745],[519,734],[515,721],[514,708],[515,695],[519,682],[525,671],[534,661],[544,652],[555,646],[568,642],[581,641],[594,642],[607,646],[618,652],[628,661],[637,671],[643,682],[647,695]]],
    ),
    p(
      "vga",
      "VGA video port",
      [
        "Find the blue 15-pin legacy monitor connector.",
        "Tap the port with three rows of five small contacts."
],
      "VGA is an older analog video interface. It is different from digital HDMI and DisplayPort.",
      [[[801,671],[945,671],[955,689],[949,758],[797,758],[791,689]]],
    ),
    p(
      "sd-card",
      "SD card slot",
      [
        "Find the shallow rectangular slot for a full-size SD memory card.",
        "Tap the thin card-reader slot used for removable memory cards."
],
      "An SD card slot reads compatible removable flash-memory cards.",
      [[[1082,687],[1260,687],[1260,731],[1252,739],[1090,739],[1082,731]]],
    )
  ],
};
