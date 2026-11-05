"""Original, coordinates-first SVG/PIL hardware training images.
Each drawn target outline is the source of truth for the game's JS hotspot polygons.
"""
from pathlib import Path
import math,json,random,html
import cairosvg
from shapely.geometry import LineString
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1] / 'games' / 'hardware-challenge'
ASSETS=ROOT/'assets'; ASSETS.mkdir(exist_ok=True)
W,H=1448,1086
R=random.Random(67)

class Scene:
 def __init__(self):
  self.s=[];self.regions={}
  self.s.append('''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1448" height="1086" viewBox="0 0 1448 1086">
<defs>
 <radialGradient id="studio"><stop stop-color="#fbf5ec"/><stop offset=".56" stop-color="#f4ede5"/><stop offset="1" stop-color="#e9ded2"/></radialGradient>
 <linearGradient id="metal" x2="0" y2="1"><stop stop-color="#cfd7db"/><stop offset=".12" stop-color="#f2f5f4"/><stop offset=".45" stop-color="#c7cbcb"/><stop offset=".82" stop-color="#a8b1b7"/><stop offset="1" stop-color="#808e98"/></linearGradient>
 <linearGradient id="dark" x2="1" y2="1"><stop stop-color="#424f58"/><stop offset=".47" stop-color="#202e39"/><stop offset="1" stop-color="#101a25"/></linearGradient>
 <linearGradient id="board" x2=".1" y2="0" x1=".8" y1="1"><stop stop-color="#184f5b"/><stop offset=".45" stop-color="#103a48"/><stop offset="1" stop-color="#0b2d3a"/></linearGradient>
 <linearGradient id="copper" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f9c18d"/><stop offset=".2" stop-color="#f59a50"/><stop offset=".55" stop-color="#a54d26"/><stop offset=".9" stop-color="#db7338"/><stop offset="1" stop-color="#6d301f"/></linearGradient>
 <linearGradient id="battery" x2=".1" y2="1"><stop stop-color="#252f3a"/><stop offset=".5" stop-color="#151d29"/><stop offset="1" stop-color="#111721"/></linearGradient>
 <linearGradient id="gold" x2="0" y2="1"><stop stop-color="#ffe4a0"/><stop offset="1" stop-color="#b17d28"/></linearGradient>
 <linearGradient id="panel" x2=".2" y2="1"><stop stop-color="#eff3f3"/><stop offset=".3" stop-color="#c8cdd0"/><stop offset=".7" stop-color="#aebbc2"/><stop offset="1" stop-color="#85949e"/></linearGradient>
 <linearGradient id="socket" x2="0" y2="1"><stop stop-color="#151f27"/><stop offset=".5" stop-color="#07121b"/><stop offset="1" stop-color="#243440"/></linearGradient>
 <pattern id="brush" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 1H6 M0 4H6" stroke="#fff" opacity=".18" stroke-width=".45"/></pattern>
 <pattern id="circuits" width="110" height="90" patternUnits="userSpaceOnUse"><path d="M4 15H32V40H69 M8 63H60V73H96 M40 4V14H80V42H104 M73 10V25H100" fill="none" stroke="#4e9e91" opacity=".34" stroke-width="1.15"/><circle cx="33" cy="40" r="2.8" fill="#bba86d"/><circle cx="60" cy="63" r="2.3" fill="#bba86d"/></pattern>
 </defs>
 <rect width="1448" height="1086" fill="url(#studio)"/>
 <ellipse cx="728" cy="930" rx="605" ry="84" fill="#8c8179" opacity=".12"/>
 <ellipse cx="728" cy="924" rx="560" ry="60" fill="#786f68" opacity=".13"/>
''')
 def add(self,s):self.s.append(s)
 def rect(self,x,y,w,h,fill,rx=0,stroke='none',sw=1,opacity=1):
  self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"/>')
 def circ(self,cx,cy,r,fill,stroke='none',sw=1,opacity=1):
  self.add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}"/>')
 def path(self,d,stroke,sw,fill='none',opacity=1):
  self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}" stroke-linecap="round" stroke-linejoin="round"/>')
 def poly(self,pts,fill,stroke='none',sw=1,opacity=1):
  self.add(f'<polygon points="{" ".join(f"{x},{y}" for x,y in pts)}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" opacity="{opacity}" stroke-linejoin="round"/>')
 def text(self,x,y,t,sz=14,col='#33414a',opacity=.7,anchor='start',weight=600,spacing=1):
  self.add(f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{sz}" font-weight="{weight}" letter-spacing="{spacing}" fill="{col}" opacity="{opacity}" text-anchor="{anchor}">{html.escape(t)}</text>')
 def screw(self,x,y,rad=6):
  self.circ(x,y,rad+2,'#5e6d72','#3e4b55',1)
  self.circ(x,y,rad,'#cad2d5','#f2f5f0',.9)
  self.path(f'M{x-rad*.58:.1f} {y+rad*.36:.1f} L{x+rad*.58:.1f} {y-rad*.36:.1f}','#78838b',1.7)
 def hotspot(self,id,poly):
  self.regions.setdefault(id,[]).append([[round(x),round(y)] for x,y in poly])
 def boxhot(self,id,x,y,w,h):self.hotspot(id,[(x,y),(x+w,y),(x+w,y+h),(x,y+h)])
 def circlehot(self,id,cx,cy,r,n=32):self.hotspot(id,[(cx+r*math.cos(2*math.pi*i/n),cy+r*math.sin(2*math.pi*i/n)) for i in range(n)])
 def finish(self,name):
  self.add('</svg>')
  svg='\n'.join(self.s)
  (ASSETS/f'{name}-source.svg').write_text(svg)
  cairosvg.svg2png(bytestring=svg.encode(),write_to=str(ASSETS/f'{name}.png'),output_width=W,output_height=H)
  # thumbnail as clean image (not overlaid)
  im=Image.open(ASSETS/f'{name}.png').convert('RGB')
  im.thumbnail((800,600),Image.Resampling.LANCZOS)
  im.save(ASSETS/f'{name}-thumbnail.jpg',quality=87,optimize=True)
  return self.regions

s=Scene()
# Laptop aluminum outer shell and hinge
s.rect(147,168,1154,759,'#a1a6ac',40,stroke='#5d666d',sw=7)
s.rect(153,174,1142,746,'url(#metal)',36,'#f8f7f2',3)
s.rect(170,192,1108,705,'#303b42',28,'#17212a',7)
s.rect(192,209,1064,657,'#182732',18,'#445560',2)
s.rect(209,218,1030,446,'url(#board)',13,'#090e14',3)
s.rect(212,223,1024,437,'url(#circuits)',8,opacity=.9)
# top exhaust / hinges
s.rect(199,194,1058,24,'#35454d',9)
for x in range(234,1210,12):s.rect(x,199,5,9,'#76838b',1)
for x in (218,1230):
 for y in (234,648,877):s.screw(x,y,7)
# busy PCB components in free areas
for _ in range(210):
 x=R.randint(234,1210);y=R.randint(244,642)
 # avoid major dominant parts zones
 if (x<475 and y<493) or (x>960 and y<485) or (520<x<900 and 285<y<580) or (220<x<438 and 500<y<615) or (870<x<1190 and 505<y<610):continue
 if R.random()<.37:
  s.rect(x,y,R.randint(5,13),R.randint(3,7),'#091b27',1,'#547577',.7,.8)
 else:s.rect(x,y,R.choice([2,3,5]),R.choice([2,3,4]),R.choice(['#c5a76b','#7ac5bb','#b6cad0']),.7,opacity=.7)
# CPU cover, integrated under heat pipes
s.rect(642,296,171,146,'#091621',18,'#6d7c7c',5)
s.rect(661,314,135,111,'url(#metal)',12,'#b7c2c3',3)
s.rect(682,333,93,74,'#c8d1cf',4,'#a0afb1',1)
s.text(730,368,'PROCESSOR',11,'#68747a',.6,'middle',700,1.4)
s.text(730,385,'THERMAL PLATE',7,'#66747b',.6,'middle',600,1)
for x in (656,797):
 for y in (309,432):s.screw(x,y,5)
# Copper heat pipes bend from the CPU plate toward both fin stacks; target matches strokes.
heatpaths=[[(639,344),(607,344),(580,324),(543,312),(485,312)],[(639,363),(600,363),(563,343),(530,339),(485,339)],[(811,344),(852,344),(879,321),(920,312),(970,312)],[(811,363),(850,365),(890,344),(927,337),(970,338)]]
for pts in heatpaths:
 d='M'+' L'.join(f'{x} {y}' for x,y in pts)
 s.path(d,'#592c20',19);s.path(d,'url(#copper)',15);s.path(d,'#ffcf9b',2,opacity=.8)
 # stop before fan/CPU overlap
 geo=LineString(pts).buffer(9, cap_style=2,join_style=1,resolution=8).simplify(1.0)
 s.hotspot('heatpipes',list(geo.exterior.coords)[:-1])
# two fin assemblies (above fans, don't touch fans)
for x in (484,879):
 s.rect(x,228,95,48,'#42505c',5,'#080f18',2)
 for xx in range(x+8,x+93,7):s.rect(xx,230,4,44,'url(#metal)',1,'#78828b',.35)
 s.boxhot('fin-stack',x+2,229,91,46)
# Fans spinning hubs - central black fan housings with 11 blades
for id,cx in [('fan-left',347),('fan-right',1097)]:
 cy=369
 s.circ(cx,cy,115,'#0a141c','#79828a',6)
 s.circ(cx,cy,106,'#263d47','#141e27',2)
 s.circ(cx,cy,91,'#08121a','#566973',3)
 for j in range(12):
  a=2*math.pi*j/12
  x1=cx+26*math.cos(a);y1=cy+26*math.sin(a)
  p1=(cx+93*math.cos(a+.2),cy+93*math.sin(a+.2))
  p2=(cx+72*math.cos(a+.6),cy+72*math.sin(a+.6))
  s.path(f'M{x1:.1f} {y1:.1f} Q{cx+86*math.cos(a-.05):.1f} {cy+86*math.sin(a-.05):.1f} {p1[0]:.1f} {p1[1]:.1f} Q{cx+84*math.cos(a+.41):.1f} {cy+84*math.sin(a+.41):.1f} {p2[0]:.1f} {p2[1]:.1f} Z','#0b202e',1.2,'#2b404b')
 s.circ(cx,cy,38,'#3e535f','#77838c',4);s.circ(cx,cy,26,'#121d27','#b2bcc0',2)
 s.circ(cx,cy,9,'#d4dadd','#18232c',2)
 for a in (45,135,225,315):
  x=cx+106*math.cos(math.radians(a));y=cy+106*math.sin(math.radians(a));s.screw(round(x),round(y),4)
 s.circlehot(id,cx,cy,106)
# memory SO-DIMM under processor, flat green board horizontal
s.rect(520,472,334,103,'#0b171a',9,'#647279',4)
s.rect(533,485,309,72,'#195d47',4,'#85a58b',2)
for x in range(542,819,15):s.rect(x,550,10,9,'url(#gold)',1)
for x in (561,617,673,729,784):
 s.rect(x,497,32,38,'#0c2930',3,'#536d6c',1)
 s.text(x+16,521,'▤',15,'#68898a',.55,'middle')
for x in (524,841):s.rect(x,493,8,57,'#dbe5e1',2,'#8a9394',1)
s.boxhot('ram',532,483,311,77)
# 2280 M.2 SSD, separate long card on the right, top of lower board
s.rect(885,510,303,106,'#071b28',9,'#53646a',3)
s.rect(900,522,275,79,'#206052',5,'#8eaca3',2)
for x in (914,972,1030):s.rect(x,533,42,49,'#132a33',3,'#5e7f7a',1)
for x in range(919,1152,12):s.rect(x,594,8,7,'url(#gold)',1)
s.circ(1166,560,11,'#cad3d4','#52616d',2)
s.text(1040,577,'NVMe',12,'#e0ddd1',.56,'middle',700,2)
s.boxhot('ssd',900,522,275,79)
# WLAN M.2 card with two separate antenna coax connectors
s.rect(236,501,216,117,'#101f2b',10,'#687b83',3)
s.rect(250,517,174,88,'#255c66',6,'#92a6a6',2)
s.rect(281,531,80,51,'#b0bebc',4,'#f3eee7',1)
for x in (376,398):s.circ(x,535,7,'url(#gold)','#1f3a45',3)
s.path('M375 531 C320 478 254 470 257 430','#e7d7b1',4)
s.path('M398 530 C436 479 462 477 478 452','#171c24',4)
s.boxhot('wifi',248,510,194,98)
# ribbon connector and flex cable under memory, ending before battery
s.rect(666,600,111,23,'#202e37',5,'#b9c8c7',1)
s.rect(690,621,65,61,'#c69d58',3,'#6b592c',1)
for x in range(694,753,5):s.path(f'M{x} 625 V675','#efc581',1.3)
s.rect(681,668,85,12,'#456ba3',2,'#bed9f0',1)
s.boxhot('ribbon',688,623,69,55)
# chassis mid separator, narrow power wires to battery
s.rect(211,649,1027,30,'#35404a',7,'#64727a',2)
for x in range(235,1220,55):s.screw(x,663,3)
# battery: large 6-cell slab, side metal mounts
s.rect(329,692,793,166,'#09131b',15,'#727b80',5)
s.rect(343,705,765,137,'url(#battery)',12,'#2f454b',2)
for i in range(6):
 x=353+i*126
 s.rect(x,713,116,119,R.choice(['#171f2c','#1a2531','#19242f']),8,'#3c4a52',1)
 s.rect(x+7,719,5,102,'#415363',2,opacity=.36)
 s.rect(x+10,822,94,2,'#5c6875',1,opacity=.35)
s.rect(664,707,126,13,'#61747c',2,opacity=.8)
s.text(725,779,'Li-ion',23,'#bbc0bb',.47,'middle',700,2)
s.text(725,802,'RECHARGEABLE BATTERY PACK',9,'#9ca9af',.58,'middle',600,1.5)
for x in (350,1101):s.screw(x,699,5)
s.boxhot('battery',342,705,768,138)
# left/right speakers: low long housings, connected by visible wires
for id,x in [('speaker-left',221),('speaker-right',1129)]:
 s.rect(x,741,93,124,'#17222c',14,'#6b7d83',3)
 s.rect(x+10,751,73,105,'#101820',10,'#2c3b45',2)
 for oy in range(767,846,18):
  for ox in (x+27,x+47,x+67):s.circ(ox,oy,3,'#384c58')
 s.rect(x+27,782,39,51,'#1c3340',6,'#5e7077',1)
 s.boxhot(id,x+9,750,76,107)
# diagnostic tiny cables within unclickable region
s.path('M310 812 C334 800 330 671 352 661','#f5bd49',4)
s.path('M1133 812 C1117 803 1119 675 1099 663','#3290a9',4)
# edge fasteners and highlight
s.rect(170,896,1114,17,'#bfc6c5',5,'#90999e',1)
for x in (250,465,685,900,1120):s.screw(x,898,4)
laptop_targets=s.finish('hc6')

# -------------------------------------------------------------------------
# Dedicated training I/O panel: socket cutouts are intentionally large enough
# for reliable tapping, while outlines follow the exact metal/socket shape.
# -------------------------------------------------------------------------
s=Scene()
s.rect(106,231,1236,678,'#7d8589',30,'#5c656d',6)
s.rect(112,225,1224,675,'url(#metal)',26,'#fcfcf8',4)
s.rect(122,237,1204,651,'url(#brush)',23,opacity=.45)
s.rect(134,254,1180,615,'#bec9ce',17,'#65747e',4)
s.rect(141,263,1166,598,'#d1dadb',13,'#edf2f0',2)
s.rect(149,270,1150,583,'url(#panel)',12,opacity=.75)
# steel station label at top - not port hints
s.rect(555,181,338,52,'#293b48',13,'#89969a',3)
s.text(724,216,'HARDWARE I/O LAB',19,'#e7edf0',.85,'middle',700,4)
# Two rows of four deep recessed mounting plates, no name labels
cols=[167,458,749,1040];ys=[301,573]
for yy in ys:
 for xx in cols:
  s.rect(xx,yy,241,228,'#72818a',17,'#f2f7f6',2)
  s.rect(xx+7,yy+7,227,214,'#bbc6ca',11,'#6b7d85',2)
  s.rect(xx+13,yy+12,215,202,'url(#panel)',9,'#e8eeeb',1)
  s.rect(xx+14,yy+13,212,36,'#e9eff0',8,opacity=.38)
  for ox,oy in ((xx+25,yy+25),(xx+217,yy+25),(xx+25,yy+203),(xx+217,yy+203)):
   s.screw(ox,oy,4)
# top left USB Type-A: wide rect, central tongue and gold contacts
s.rect(217,389,144,82,'#8d9a9c',10,'#59656c',4)
s.rect(226,398,126,65,'url(#socket)',5,'#111b25',2)
s.rect(237,417,104,24,'#366d95',3,'#5c97b7',1)
for x in (257,287,317):s.rect(x,416,8,9,'#d6bd7b',1)
s.boxhot('usb-a',217,389,144,82)
# top 2 USB-C: elliptical centered symmetry, 2 rows contacts
s.rect(513,405,139,50,'#73868f',24,'#f0f2ef',4)
s.rect(521,412,123,36,'url(#socket)',18,'#0a1720',2)
s.rect(531,422,102,14,'#343f48',7,'#7b868f',1)
for x in range(537,634,9):s.rect(x,419,4,3,'#d4ba75',1)
s.boxhot('usb-c',513,405,139,50)
# upper HDMI: characteristic trapezoid geometry
hdmip=[(806,393),(935,393),(959,413),(951,465),(792,465),(783,413)]
s.poly(hdmip,'#89989e','#f5f7f1',4)
s.poly([(814,405),(928,405),(944,417),(937,453),(805,453),(796,417)],'url(#socket)','#3d4e57',3)
s.poly([(826,425),(914,425),(928,437),(917,441),(817,441),(811,438)],'#a09378','#b4ac8f',1)
for x in range(830,916,7):s.rect(x,423,2,4,'url(#gold)',1)
s.hotspot('hdmi',hdmip)
# upper DisplayPort: clipped one upper corner, not the same shape as HDMI
DP=[(1093,391),(1230,391),(1253,417),(1253,465),(1093,465)]
s.poly(DP,'#84939c','#f1f3f0',4)
s.poly([(1102,403),(1226,403),(1241,419),(1241,453),(1102,453)],'url(#socket)','#394d55',3)
s.rect(1115,426,112,15,'#39424b',3,'#8b9297',1)
for x in range(1119,1226,8):s.rect(x,423,3,3,'url(#gold)',1)
s.hotspot('displayport',DP)
# Ethernet (RJ-45): notch for retaining clip, 8 contacts
outer=[(211,641),(354,641),(354,764),(332,764),(332,777),(233,777),(233,764),(211,764)]
s.poly(outer,'#a0acb0','#edf2f0',4)
inner=[(222,653),(343,653),(343,752),(324,752),(324,767),(242,767),(242,752),(222,752)]
s.poly(inner,'url(#socket)','#344955',2)
for x in range(235,335,13):s.rect(x,657,7,23,'url(#gold)',1)
s.rect(250,721,64,18,'#263d45',3,'#62747c',1)
s.hotspot('ethernet',outer)
# 3.5mm audio port: circular metal ring and recessed dark hole
s.circ(581,708,67,'#8296a0','#f4f5f2',4)
s.circ(581,708,51,'#bcc5c8','#70838b',2)
s.circ(581,708,39,'url(#socket)','#293b45',4)
s.circ(581,708,19,'#060c13','#384953',2)
s.circlehot('audio',581,708,67)
# Blue 15-pin VGA D-Sub with 3 rows of five hole pins
vgap=[(801,671),(945,671),(955,689),(949,758),(797,758),(791,689)]
s.poly(vgap,'#7b8ca2','#f2f5f3',3)
s.poly([(815,686),(930,686),(938,697),(933,743),(809,743),(804,697)],'#4473ba','#18375f',3)
for yy,xx0 in [(700,822),(714,828),(728,822)]:
 for j in range(5):s.circ(xx0+22*j,yy,3.8,'#dbbd76','#18345a',1)
for x in (801,944):s.screw(x,715,5)
s.hotspot('vga',vgap)
# full-size SD card slot, shallow narrow cutout with chamfered lower corners
sdpoly=[(1082,687),(1260,687),(1260,731),(1252,739),(1090,739),(1082,731)]
s.poly(sdpoly,'#8b999d','#f4f5ef',3)
s.rect(1090,698,162,23,'url(#socket)',4,'#3d525b',2)
s.rect(1100,703,139,5,'#51616c',2)
for x in range(1102,1241,12):s.rect(x,702,5,3,'#cbb474',1)
s.hotspot('sd-card',sdpoly)
# subtle metal footer edge and plate hardware
s.rect(143,848,1157,10,'#9caab0',3,opacity=.56)
for x in (144,1302):
 for y in (259,867):s.screw(x,y,6)
port_targets=s.finish('hc7')

mapping={'6':laptop_targets,'7':port_targets}
(ROOT/'new-level-hotspot-map.json').write_text(json.dumps(mapping,indent=2))
# output quick geometry diagnostics
for lid,targets in mapping.items():
 print('LEVEL',lid,'TARGETS',len(targets))
 for k,regs in targets.items():
  print(' ',k,len(regs),'regions')
