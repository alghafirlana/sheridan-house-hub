/**
 * Server Explorer / hc5.png. Pixel-aligned to the exact 1448 x 1086 image.
 * The source was AI-generated; identify only clearly pictured structures.
 * Digital-only, freely playable in Explore Hardware. Competitive scoring stays
 * fixed at four levels for fall-2026 until the next event is configured.
 */
const p = (id, label, questionVariants, fact, regions) => ({
  id, label, question: questionVariants[0], questionVariants, fact,
  regions,
});
export const SERVER_LEVEL = {
  id: 5,
  title: "Inside a Server",
  subtitle: "Rack server · internal components",
  description: "Explore processors, memory, cooling, drive bays and serviceable modules.",
  image: "assets/hc5.png",
  width: 1448,
  height: 1086,
  displayRotation: 0,
  availability: "digital",
  enabled: true,
  questionsPerRound: 6,
  targets: [
    p("cpu-upper", "Upper processor", ["Find the upper processor in the server.", "Tap the square processor area above the centre."], "Servers often use processors to handle many concurrent workloads.", [[[708, 318], [847, 318], [848, 432], [707, 432]]]),
    p("cpu-lower", "Lower processor", ["Find the lower processor.", "Tap the second square processor area near the bottom."], "This image depicts two separate processor positions in the server.", [[[708, 624], [847, 624], [846, 742], [706, 742]]]),
    p("ram-upper", "Upper memory bank", ["Tap the row of memory modules above the first processor.", "Find the top group of long RAM modules."], "Server memory holds data actively being used by programs.", [[[660, 217], [879, 217], [879, 307], [660, 307]]]),
    p("ram-middle", "Centre memory banks", ["Find the memory modules between the two processors.", "Tap the long RAM sticks in the middle of the server."], "Servers may contain many memory modules for demanding workloads.", [[[654, 443], [881, 443], [881, 614], [654, 614]]]),
    p("ram-lower", "Lower memory bank", ["Find the row of memory modules below the second processor.", "Tap the bottom RAM bank."], "More memory can help a server run more applications and tasks.", [[[651, 746], [882, 746], [881, 840], [651, 840]]]),
    p("fan-bank", "Cooling fan bank", ["Find the vertical stack of black cooling fans.", "Tap the column of fans beside the memory."], "Fans move air through the server to cool its components.", [[[455, 213], [568, 213], [568, 849], [455, 849]]]),
    p("heatsink-upper", "Upper finned heatsink", ["Tap the tall silver finned heatsink near the upper CPU.", "Find the upper vertical metal cooling fins."], "Heatsinks help move heat away from busy processors and chips.", [[[579, 225], [630, 225], [631, 506], [580, 506]]]),
    p("heatsink-lower", "Lower finned heatsink", ["Find the second vertical finned heatsink.", "Tap the lower silver heatsink beside the fans."], "Cooling hardware dissipates heat to maintain safe operating temperatures.", [[[579, 551], [630, 551], [631, 831], [579, 831]]]),
    p("heat-pipes-upper", "Upper copper heat pipes", ["Find the copper-coloured heat pipes beside the upper processor.", "Tap the orange copper pipes near the upper CPU."], "Heat pipes transfer heat between hot components and cooling surfaces.", [[[621, 350], [664, 344], [683, 349], [686, 395], [663, 396], [624, 384]]]),
    p("heat-pipes-lower", "Lower copper heat pipes", ["Find the lower set of copper heat pipes.", "Tap the copper pipes beside the lower processor."], "Copper pipes are often used to carry heat toward heatsinks.", [[[620, 655], [671, 653], [687, 663], [686, 704], [665, 710], [621, 696]]]),
    p("drive-bays", "Upper drive bay covers", ["Find the large silver drive bay area on the upper right.", "Tap the big silver rectangular section on the right side."], "Servers often organize replaceable storage devices in dedicated bays.", [[[1006, 194], [1193, 194], [1195, 452], [1005, 452]]]),
    p("drive-module-upper", "Upper removable module", ["Tap the upper silver rectangular removable module.", "Find the narrow upper module with the blue release tab."], "Tool-less latches can make server modules easier to service.", [[[1029, 466], [1205, 466], [1205, 534], [1029, 534]]]),
    p("drive-module-lower", "Lower removable module", ["Find the lower horizontal silver module.", "Tap the second module with the blue release tab."], "Servers use modular parts to simplify maintenance.", [[[1025, 680], [1206, 680], [1205, 739], [1026, 739]]]),
    p("rear-red-boards", "Red circuit boards", ["Find the tall red circuit-board area near the left side.", "Tap the red electronics behind the cooling fans."], "A server contains several circuit boards linking hardware subsystems.", [[[379, 290], [445, 289], [445, 765], [379, 764]]]),
    p("power-module", "Lower-right vented module", ["Find the vented metal module near the bottom-right corner.", "Tap the silver box with black ventilation holes."], "Vented enclosures allow air to flow around internal electronics.", [[[1068, 741], [1223, 740], [1224, 848], [1067, 848]]]),
  ],
};
