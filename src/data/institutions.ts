// src/data/institutions.ts
//
// Institution names, one per line, kept apart from the search code so the
// list can grow or be replaced without touching anything else.

const RAW_INSTITUTIONS = `
University of Exeter - Streatham Campus
Navitas Group - Western Sydney University International College
Colorado State University
University of Surrey
Navitas Group - Hertfordshire International College (HIC) at University of Hertfordshire
Navitas Group - International College Portsmouth (ICP) at University of Portsmouth
TAFE NSW
Navitas Group - Birmingham City University International College (BCUIC)
Navitas Group - Keele University International College
Glasgow Caledonian University (GCU) - Glasgow
University of Sunderland - Sunderland Campus
Navitas Group - Curtin College
Navitas Group - Brunel University London Pathway College
University of Massachusetts Dartmouth
University of Exeter - Penryn Campus
Navitas Group - Queens College, City University of New York
California State University San Marcos
Navitas Group - International College of Manitoba
University of New Brunswick - Fredericton Campus
University of Wollongong - Dubai Campus
Navitas Group - Toronto Metropolitan University International College
Saskatchewan Polytechnic - Saskatoon Campus
University of New Brunswick - Saint John Campus
Navitas Group - Fraser International College
Navitas Group - Western Sydney University - Sydney City Campus
California State University - Monterey Bay
Saskatchewan Polytechnic - Regina Campus
Tacoma Community College
Saskatchewan Polytechnic - Moose Jaw Campus
Navitas Group - Wilfrid Laurier International College - Waterloo Campus
Glasgow Caledonian University (GCU) - London
University of Sunderland - London campus
Full Sail University
University of Cumbria - Lancaster Campus
Saskatchewan Polytechnic - Prince Albert Campus
University of Exeter - St Lukes Campus
Oxford College of Canada
Navitas Group - La Trobe University - Sydney Campus
Schiller International University - Paris Campus Via GEDU
Global Banking School (GBS) - Malta Campus Via GEDU
Navitas Group - Charles Sturt University - Melbourne Campus
Navitas Group - Charles Sturt University - Sydney Campus
Schiller International University - Heidelberg Campus Via GEDU
Schiller International University - Madrid Campus Via GEDU
Schiller International University via GEDU
University of Cumbria (Ambleside Campus)
Global Business Studies (GBS) - Dubai Campus Via GEDU
UMASS Dartmouth via Green River
University of Cumbria (Carlisle - Fusehill Street Campus)
University of Cumbria (Carlisle - Brampton Road Campus)
ICN Business School - Paris Campus Via GEDU
Keck Graduate Institute
Saskatchewan Polytechnic - Online
ICN Business School - Nancy Campus Via GEDU
ICN Business School - Berlin Campus Via GEDU
McTimoney College of Chiropractic
University of Cumbria (London Campus)
INTO Group - UWA College
LearnDirect
UNSW College - Kensington Campus
INTO Group - University of East Anglia International Study Centre
INTO Group - Hofstra University
INTO Group - University of Exeter International Study Centre
University of Auckland - City Campus
Study Group - Royal Holloway University of London International Study Centre
La Trobe University - Melbourne Campus
INTO Group - Lancaster University International Study Centre
INTO - Queens University Belfast International Study Centre
INTO Group - Oregon State University - Corvallis Campus
Study Group - The University of Sheffield international College
Keele University
University of Aberdeen - Foresterhill Campus
INTO Group - George Mason University
The University of Waikato - Hamilton Campus
Kent State University
University of Wollongong - Wollongong Campus
Victoria University of Wellington - Kelburn campus
Study Group - University of Sussex International Study Centre
Montclair State University
University of Birmingham
University of Strathclyde
University of Nebraska Omaha
University of Reading - Whiteknights campus
INTO Group - Suffolk University
Study Group - Durham University International Study Centre - Queens Campus
Coventry University
INTO Group - Saint Louis University
University of Cincinnati - West Campus
Northumbria University - Newcastle City Campus
University of York
Queens University Belfast
Study Group - Cardiff University International Study Centre
Study Group - DePaul University
Navitas Group - Eynesbury College
INTO Group - The University of Alabama at Birmingham
The University of Memphis
University of Southampton - Highfield Campus
Oklahoma State University
Shorelight Group -Stony Brook University
Study Group - University of Strathclyde International Study Centre
University of West London
Study Group - Liverpool John Moores University International Study Centre
Victoria University of Wellington - Te Aro campus
University of Hertfordshire - Hatfield Campus (CI)
INTO Group - Illinois State University
Victoria University of Wellington - Pipitea Campus
University of Idaho
Leeds Beckett University - City Campus
Middle Tennessee State University
Trent University - Peterborough Campus
INTO Group - The University of Oklahoma
Study Group - Leeds Beckett University International Study Centre
Navitas Group - La Trobe College - Melbourne Campus
Seneca Polytechnic - Newnham Campus
Southern Illinois University Edwardsville
Study Group - University of Aberdeen International Study Centre
College of the Canyons
Carleton University
Middlesex University London
University of East London - Docklands Campus
Technological University Dublin
OIEG Group - International College Dundee
Tennessee Technological University
University of Alberta - North Campus (CI)
Texas State University
University College Cork
INTO Group - Montclair State University
Navitas Group - The College, Swansea University
University of Brighton - Moulsecoomb Campus
University of Auckland - Grafton Campus
University of Ottawa (CI)
Wichita State University
Lakehead University - Thunder Bay Campus
University of Windsor
INTO Group - City St Georges, University of London International Study Centre
RMIT University - Melbourne City Campus
University of Regina
University of South Dakota - Vermillion Campus
The University of New Mexico
Northern Arizona University
London South Bank University
Robert Gordon University
University of North Texas - Denton Campus Via University Study
Navitas Group - Taylors College
Dallas Baptist University
Navitas Group - Anglia Ruskin University College
University of Central Oklahoma
Shorelight Group - Heriot-Watt University - Edinburgh Campus
California State University - Fresno
California State University - Sacramento
University of Greenwich - Greenwich Campus
University of Wolverhampton - City Campus
Navitas Group - Manchester Metropolitan University International College
INTO Group - Drew University
Southern Connecticut State University
San Francisco State University
Washington State University
Edinburgh Napier University - Sighthill Campus
Shorelight Group - Louisiana State University
University of New Haven via University Study
California State University - San Bernardino
University of Galway
Central Michigan University via University Study
Webster University - St. Louis Campus
University of Bedfordshire - Luton Campus (CI)
Mohawk College - Fennell Campus (CI)
Central Washington University - Ellensburg Campus
University of Limerick
Birmingham City University - City Centre Campus
California State University - East Bay
University of Central Missouri
Shoreline Community College
HUB - Central Michigan University
Portland State University
University of the West of England - Bristol - Frenchay Campus
Blyth Academy -Downsview Park
INTO Group - Colorado State University
Edge Hill University
INTO Group - University of Stirling
Study Group - University of Surrey International Study Centre
Blyth Academy - Orbit Virtual Campus
Seattle University via University Study
University of Guelph (CI)
Auckland University of Technology - City Campus
University of Delaware
Blyth Academy - Ciha
Study Group - University of Leeds International Study Centre
York University - Keele Campus
University of Houston - Clearlake via University Study
University of Wisconsin-La Crosse
California State University, Dominguez Hills - Carson Campus
Middlesex University - Dubai Campus
Bath Spa University - Newton Park Campus
Study Group - University of Huddersfield International Study Centre
The University of Winnipeg (GE)
Wilfrid Laurier University - Waterloo Campus
Fanshawe College - London Campus (GE)
University of Louisville
Algonquin College - Ottawa Campus (CI)
Blyth Academy - Lawrence Park
Massey University - Online
Brock University
Shorelight Group - Auburn University
Blyth Academy - Mississauga
Douglas College - New Westminster Campus
Shorelight Group - University of Dayton
University of North Carolina Wilmington
Santa Barbara City College
Study Group - Florida Atlantic University - Boca Raton Campus
University of South Wales - Treforest Campus
Ontario Tech University
Shorelight Group - University of Wisconsin-Eau Claire
TaF.tc
Humber Polytechnic - North Campus (GE)
Shorelight Group - Belmont University
Murdoch University via Kaplan Singapore
Shorelight Group - University of South Carolina
University of Birmingham - Dubai Campus
San Jose State University via University Study
University of Wisconsin Eau Claire
New York University- Steinhardt via University Study
OIEG Group - University of Bradford International College
Orange Coast College
The University of Waikato - Tauranga Campus
Elmhurst University
Navitas Group - University of Plymouth International College (UPIC) at Plymouth University
Maynooth University
Northern Alberta Institute of Technology (NAIT)
Shorelight Group - The University of Texas at San Antonio
University of Debrecen
Pittsburg State University
Rowan University
University of Chester - Exton Park (Parkgate Road)
Shorelight Group - University of Nevada Reno
Swinburne College via UP Education
University of New Hampshire via University Study - Durham Campus
Cambrian College - Barrydowne Campus (GE)
Durham College - Oshawa Campus
Troy University - Troy Campus
University of Auckland - Newmarket Campus
University of Wisconsin - Whitewater
Embry-Riddle Aeronautical University - Daytona Beach Campus
Longwood University
Shorelight Group - Rutgers University - New Brunswick
Shorelight Group - The University of Utah
Georgian College - Barrie Campus
Southern Alberta Institute of Technology (SAIT)
University of North Alabama
Nipissing University (CI)
California State University - Chico via University Study
GUS - Canterbury Christ Church University - Canterbury Campus
Contra Costa Community College District - Diablo Valley College
Shorelight Group - University of Wyoming
Trent University - Durham GTA Campus
University for the Creative Arts - Farnham Campus
Sheridan College - Trafalgar Road Campus
Lewis University
Shorelight Group - University of Central Florida
University of Northern British Columbia (UNBC) - Prince George Campus
Study Group - New Jersey Institute of Technology
North Seattle College
University of Colorado Denver
Asia Pacific University of Technology and Innovation
Oxford International Education Group - University of Notre Dame - Fremantle Campus
Oxford International Education Group - University of Notre Dame - Sydney Campus
Murray State University
OIEG Group - San Francisco State University
Sacred Heart University
Sheridan College - Hazel McCallion Campus
Kaplan Group - University of Victoria (CI)
Kwantlen Polytechnic University - Surrey Campus (CI)
Youngstown State University
Enrollment Advisory Group - Nova Southeastern University
Leeds Beckett University - Headingley Campus
Shorelight Group - University at Buffalo, State University of New York
Technological University Dublin - Grangegorman Campus
VIZJA University
Langara College (CI)
Study Group - Kingston University London International Study Centre
Western New England University
Enrollment Advisory Group - William Paterson University
South East Technological University - Carlow Campus
University of Scranton via University Study
Mercy University - Westchester Campus
OIEG Group - Edinburgh Napier University International College
Oxford Brookes University via QA Higher Education
Sonoma State University
Shorelight Group - Saint Marys College of California
Shorelight Group - University of Alaska Fairbanks
Kennesaw State University
Post University
Seneca Polytechnic - Seneca at York Campus
Shorelight Group - University of Wisconsin - Whitewater
University of Pecs
University of Indianapolis
University of the Pacific
Wrexham University - Wrexham Campus (Partner Universtiy)
Dundalk Institute of Technology
Shorelight Group - University of Wisconsin-Stevens Point
MacEwan University
Navitas Group - Murdoch University - Dubai Campus
Shorelight Group - Seattle University
South East Technological University - Waterford Campus
The University of Buckingham
University of Suffolk - Ipswich Campus
British Columbia Institute of Technology - Burnaby Campus
Loyalist College - Belleville Campus
OIEG Group - University of Winchester
University of Lethbridge - Lethbridge Campus
University of Findlay
Enrollment Advisory Group - Colorado Mesa University
Massey University - Manawatu Campus
SUNY Plattsburgh
Shorelight Group - University of Illinois at Chicago
University of Saskatchewan
Valencia International University (VIU) via Grupo Planeta
Vistula University
Gannon University
Riverside City College
Unitec Institute of Technology - Mt Albert Campus
University of Chester - Queen Park Campus
George Brown Polytechnic (GBP) - St. James Campus (GE)
University of Vermont
INTO Group - Thomas Jefferson University - East Falls Campus
South Seattle College
Southern New Hampshire University
Shorelight Group - Adelphi University
University of Manitoba - Fort Garry Campus
University of Prince Edward Island
University of the Fraser Valley - Abbotsford Campus (CI)
Centennial College - Progress Campus (CI)
Queen Margaret University
Loyola University New Orleans via University Study
Sault College - Ste. Marie Campus
Shorelight Group - University of Wisconsin - River Falls
Sup de Pub
University of Greenwich - Medway Campus
University of Southampton - Avenue Campus
Shorelight Group - American University
Shorelight Group - Illinois Wesleyan University
Shorelight Group - Oklahoma City University
Shorelight Group - University of the Pacific - Stockton Campus
Humber Polytechnic - Lakeshore Campus (GE)
Navitas Group - The University of Waikato College
Santa Monica college
UTS College
Navitas Group - The International College at Robert Gordon University (ICRGU)
San Mateo Colleges of Silicon Valley - Canada College
University of East London - University Square Stratford (USS) Campus
California State University – Sonoma via University Study
Dublin Business School
Toronto Metropolitan University
Seattle Central College
Shorelight Group - Gonzaga University
Shorelight Group - University of Massachusetts Boston
Conestoga College - Doon Campus
Lane Community College
Stevens Institute of Technology via University Study
Budapest International College (BIC)
Niagara University
San Jose City College
Study Group - Long Island University Post
The University of Wisconsin–Stout via Kings Education
Thompson Rivers University - Kamloops Campus
Massey University - Auckland Campus
New York Institute of Technology via University Study
North Park University
Southern Institute of Technology - Invercargill Campus
Westcliff University - Irvine Campus
College of Mount Saint Vincent via Kings Education
High Point University
Hope College
The University of Toledo
Cape Breton University
Contra Costa Community College District - Contra Costa College
INTO Group - Saint Louis University - Madrid Campus
Sheridan College - Davis Campus
Shorelight Group - Florida International University
Shorelight Group - Ohio Wesleyan University
Shorelight Group - Rutgers University - Camden
University of Wisconsin Oshkosh via Kings Education
Kwantlen Polytechnic University - Richmond Campus (CI)
Ara Institute of Canterbury - City Campus
Dalhousie University (CI)
La Trobe University - Bendigo Campus
SRH Universities - Berlin Campus
Shorelight Group - Missouri University of Science and Technology
Shorelight Group - St. Bonaventure University
McMurry University via Shorelight
Otago Polytechnic - Dunedin Campus
San Mateo Colleges of Silicon Valley - College of San Mateo
San Mateo Colleges of Silicon Valley - Skyline College
KTH Royal Institute of Technology Via EIT InnoEnergy
Midwestern State University
New York Institute of Technology - New York - Long Island Campus
Universidad Internacional de la Empresa (UNIE) via Grupo Planeta
Vancouver Island University - Nanaimo Campus (GE)
California Lutheran University - Thousand Oaks Campus
Shorelight Group - Robert Morris University
Study Group - Long Island University Brooklyn
The Kings University (CI)
Temple University via Green River
Tiffin University
University for the Creative Arts - Epsom Campus
University of Canterbury International College via Navitas
Budapest Metropolitan University
Griffith College - Dublin Campus - India
Southwest Minnesota State University
Swinburne University of Technology Sarawak
University of East London - Stratford Campus
University of South Wales - Glyntaff Campus
Waikato Institute of Technology (Wintec) - Hamilton City Campus
Southern Cross University - Gold Coast Campus
University of Cincinnati - East Campus
Contra Costa Community College District - Los Medanos College
GUS - The University of Law - London Bloomsbury Campus
Northumbria University London Campus via QA Higher Education
Shorelight Group - University of New England
Shorelight Group - Western Oregon University
University of East London International Study Centre via Malvern International
EU Business School - Munich Campus
INTO Group - Long Island University Brooklyn
Shorelight Group - Whittier College
St. Francis Xavier University
Embry-Riddle Aeronautical University - Prescott Campus
GUS - The University of Law - London Moorgate Campus
Kwantlen Polytechnic University - Langley Campus (CI)
OIEG Group - Bangor University International College
Pacific Lutheran University
Rome Business School via Grupo Planeta
Shorelight Group - Carroll University
Shorelight Group - Trinity Christian College
Hansa Language Centre
Mount Saint Vincent University (CI)
Confederation College - Thunder Bay Campus (CI)
George Brown Polytechnic (GBP) - Casa Loma Campus (GE)
Massachusetts College of Pharmacy and Health Sciences (MCPHS) University - Boston Campus
Massey University - Wellington Campus
New York Institute of Technology - New York City Campus
Shorelight Group - Central Methodist University
Shorelight Group - University of Portland
Fleming College - Sutherland Campus (Peterborough)
OIEG Group - University of Greenwich International College
Shorelight Group - Lynn University
University of Europe for Applied Sciences - Berlin Campus Via Global University Systems (GUS)
Auckland University of Technology - North Campus
Federation University - Mt Helen Campus
GUS - The University of Law - Manchester Campus
Green River College
Raffles Education Network - Malaysia
Shorelight Group - Auburn University at Montogomery
Shorelight Group - University of Wisconsin-Green Bay
Wilfrid Laurier University - Brantford Campus
Concordia University of Edmonton
Coventry University - London Campus
Gisma University of Applied Sciences - Berlin Campus Via Global University Systems (GUS)
Trinity Western University - Langley Campus
Wittenborg University of Applied Sciences - Apeldoorn Campus
Red River College Polytechnic - Notre Dame Campus (CI)
Shorelight Group - Randolph College
York College of Pennsylvania Via University Study
College of Central Florida
Eastern Institute of Technology - Hawke Bay Campus
GUS - Hartpury University
Raffles Education Network - Singapore
Shorelight Group - University of Mount Union
Canadore College - Commerce Court Campus (CI)
Enrollment Advisory Group - Hartwick College
GUS - The University of Law - Birmingham Campus
INSEEC - Paris Eiffel Campus Site – PGE, BBA et Master of Science
INTO Group - Long Island University Post
SEGi University
Shorelight Group - University of Wisconsin-Superior
Shorelight Group - Virginia Wesleyan University
Texas Wesleyan University
Australia Institute of Business and Technology
Capilano University - Main Campus
Curtin Singapore via Navitas
EAE Business School via Grupo Planeta
Elgin Community College (ECC)
Kaplan Business School - Melbourne Campus
Kaplan Business School - Sydney Campus
Le Cordon Bleu - Paris
Memorial University of Newfoundland - St Johns Campus
Shorelight Group- Bellarmine University
Simon Fraser University - Surrey Campus (CI)
Enrollment Advisory Group - University of Bridgeport
Fisher College
Gisma University of Applied Sciences - Potsdam Campus Via Global University Systems (GUS)
Humber Polytechnic - Downtown Campus International Graduate School (IGS) (GE)
Irvine Valley College
Kaplan Business School - Adelaide Campus
Macromedia University of Applied Sciences (Germany)
NorQuest College - Edmonton Campus
Royal Roads University
Saint Louis University
Shorelight Group - Hanover college
Shorelight Group - Hartwick College
Study Group - University College Dublin International Study Centre
University for the Creative Arts - Canterbury Campus
University of Southampton - Boldrewood Innovation Campus
Benedictine University - Lisle Campus
INTO Group - Fisher College
INTO Group - New England College
Kaplan Business School - Perth Campus
Shorelight Group - Lewis University
Shorelight Group - St. Catherine University
Shorelight Group - St. Thomas Aquinas College
University of California - Los Angeles (UCLA) Extension
Bath Spa University - Locksbrook Campus
INSEEC - Bordeaux Site – Building of the 136
Kaplan Business School - Brisbane Campus
Shorelight Group - The New School
Technological University Dublin - Tallaght Campus
Mercy University - Manhattan Campus
Navitas Group - University of Canberra College
Northern College - Timmins Campus
Shorelight Group - University of Charleston
University of Central Florida
University of Wisconsin - Superior
Caldwell University Via University Study
Conestoga College - Waterloo Campus
Fisher College via Kings Education
OHLA Schools - Boca Raton Campus
OHLA Schools - Miami Aventura Campus
OHLA Schools - Miami Brickell Campus
OHLA Schools - Orlando Celebration Campus
OHLA Schools - Tampa Campus
OIEG Group - Mercy University - Westchester Campus
Okanagan College - Kelowna Campus (CI)
SEGi College Subang Jaya via SEGi University and Colleges
Shorelight Group - Salve Regina University
Technological University Dublin - Blanchardstown Campus
Universal College of Learning (UCOL) - Manawatu Campus
University of South Wales - Cardiff Campus
Centre for English Studies Toronto
Navitas Group - Lancaster University - Leipzig Campus
OIEG Group - University of Kent International College
Shorelight Group - Schreiner University
Bow Valley College
Navitas Group - Sydney Institute of Business and Technology (SIBT)
OBS Business School via Grupo Planeta
Red River College Polytechnic - Exchange District Campus (CI)
St. Lawrence College - Kingston Campus
The Core, Entertainment Science School via Grupo Planeta
De Montfort University - Dubai Campus
Lambton College - Sarnia Campus (GE)
Le Cordon Bleu - London
Northeastern University - Toronto Campus (CI)
SEGi College Kuala Lumpur via SEGi University and Colleges
Shorelight Group - Mount St. Marys University
Simon Fraser University - Burnaby Campus (CI)
BELS
EDC Paris Business School Via Grupo Planeta
Kaplan Business School - Gold Coast Campus
Lakehead University - Orillia Campus
Reach Community College
Shorelight Group - University of Dubuque
Toi Ohomai Institute of Technology - Windermere Campus
Westcliff University - San Francisco Campus
Conestoga College - Cambridge Campus
Federation University - Berwick Campus
Moravian University via Shorelight
QA Higher Education - Ulster University - London Branch campus
Shorelight Group - Lakeland University
Shorelight Group - Washington and Jefferson College
St. Thomas University (CI)
Western Balkans University
Centre for English Studies Leeds
Durham College - Whitby Campus
GUS - The University of Law - Leeds Campus
INSEEC - Lyon
Innovación en Formación Profesional (iFP) via Grupo Planeta
Milwaukee School of Engineering University
QA Higher Education - Ulster University - Birmingham Branch Campus
Seneca Polytechnic - King Campus
Technological University Dublin - Bolton Street Campus
University of California, Irvine (UCI)
University of Europe for Applied Sciences - Hamburg Campus Via Global University Systems (GUS)
Centre for English Studies Edinburgh
Centre for English Studies London
Centre for English Studies Worthing
Navitas Group - SAE University College - Adelaide Campus
Navitas Group - SAE University College - Perth Campus
Navitas Group - SAE University College - Sydney Campus
Shorelight Group - Bridgewater College
Shorelight Group - Hiram College
Toi Ohomai Institute of Technology - Mokoia Campus
University of Bedfordshire - Bedford Campus (CI)
George Brown Polytechnic (GBP) - Waterfront Campus (GE)
Herzing University
Le Cordon Bleu - Brazil
Saint Mary’s University of Minnesota via Shorelight
University of Europe for Applied Sciences - Innovation Hub Via Global University Systems (GUS)
University of the West of England - Bristol - City Campus
Berlin School of Business and Innovation (BSBI) - Berlin Campus Via Global University Systems (GUS)
Centennial College - Morningside Campus (CI)
Hult International Business School - Boston Campus
Melbourne Polytechnic - Preston Campus
Navitas Group - SAE University College - Brisbane Campus
Royal Melbourne Institute of Technology (RMIT) Vietnam
Shorelight Group - Villanova University
Vancouver Community College - Downtown Campus
Assiniboine Community College - Victoria Avenue East Campus (Brandon) (CI)
Australian Institute of Higher Education
EU Business School - Barcelona Campus
Holmes Institute - Melbourne Campus
Hub - St. Francis College
INSEEC - Chambéry
Le Cordon Bleu - Seoul
National College of Ireland
Navitas Group - SAE University College - Melbourne Campus
Shorelight Group - Dean College
University of Europe for Applied Sciences - Dubai Campus Via Global University Systems (GUS)
Australian Harbour International College - Sydney Campus Via AEN
Berkeley College - Woodland Park Campus
Canadore College - College Drive Campus (CI)
Curtin University - Dubai Campus (UAE)
Northwood University
Shorelight Group - Eureka College
University of Brighton - Falmer Campus
University of South Wales - Newport Campus
Whitireia and WelTec - Petone Campus
Crandall University- Moncton Campus
ESLSCA Business School Paris via Grupo Planeta
Fairleigh Dickinson University - Vancouver Campus
Federation University - Gippsland Campus
Hult International Business School - San Francisco Campus
INSEEC - Marseille
Kaplan Higher Education Academy via Kaplan Singapore
La Trobe University - Albury-Wodonga Campus
SEGi College Sarawak via SEGi University and Colleges
Shorelight Group - Tulane University
Shorelight Group - Wilson College
Technological University Dublin - Aungier Street Campus
University of Southampton - Winchester Campus
Coventry University Group (CU London) - Dagenham
Coventry University Group (CU) - Coventry
Heriot-Watt University - Malaysia Campus via Shorelight
International Business School
La Trobe University - City Campus
Mykolas Romeris University
New Mexico State University via G2U
New York University- School of Professional Studies (NYUSPS) via University Study
OIEG Group - Mercy University - Bronx Campus
SRH Universities - Heidelberg Campus
Shorelight Group - University of Saint Mary
Vaughn College of Aeronautics and Technology
Arden University - Berlin Campus Via Global University Systems (GUS)
Auckland University of Technology - South Campus
Centre for English Studies Dublin
Holmes Institute - Sydney Campus
INSEEC - Rennes
Kings Education
NABA Nuova Accademia di Belle Arti - Milan
QA Higher Education - Ulster University - Manchester branch campus
University of Wolverhampton - Walsall Campus
Bethany College via G2U
Centre for English Studies Oxford
Holmes Institute - Brisbane Campus
Holmes Institute - Gold Coast Campus
INTO Group - University of Massachusetts Amherst
James Cook University - Brisbane Campus
Navitas Group - The Hague Pathway College
North Island College - Comox Valley Campus (GE)
Northumbria University - Coach Lane Campus
RMIT University - Bundoora Campus
Raffles Education Group - Raffles International College - Bangkok Campus
Shorelight Group - Colby-Sawyer College
Shorelight Group - Johns Hopkins University
South East Technological University - Wexford Campus
Southern Cross University (Venture) - Perth Campus
Toulouse Business School - Barcelona Campus
Universal College of Learning (UCOL) - Whanganui Campus
Universidad Católica San Antonio de Murcia (UCAM)
University of Europe for Applied Sciences - Iserlohn Campus Via Global University Systems (GUS)
University of North Texas - Frisco Campus via University Study
Berkeley College - New York City Midtown Campus
Centre for English Studies Harrogate
National Polytechnic of Australia
Olds College of Agriculture and Technology - Main Campus
Rochester Institute of Technology - Dubai Campus
University of Cincinnati - UC Blue Ash Campus
Vancouver Community College - Broadway Campus
Academy of Learning Career College - Scarborough Campus via Hermes Colleges Network (HCN)
Algonquin College - Pembroke Campus (CI)
INTO Group - Thomas Jefferson University - Center City Campus
Institut Supérieur de Marketing du Luxe (Sup de Luxe) via Grupo Planeta
MLA College via GEDU
Memorial University of Newfoundland - Grenfell Campus
Northumbria University via QA Higher Education
Oxford International Digital Institute via Oxford International Education Group
UP Education - Yoobee College of Creative Innovation - Christchurch Campus
University of Brighton - City Campus
Western Sydney College Via AEN
EU Business School - Geneva Campus
Griffith College - Limerick Campus - india
Hult International Business School - Dubai Campus
INSEEC - Toulouse
ISC Paris Business School - Paris Campus
La Trobe University - Mildura Campus
Perth College of Business and Technology
Southern Cross University (Venture) - Melbourne Campus
TIO Business School - Amsterdam
University of Chester - Creative Campus, Kingsway
University of Southampton - Waterfront Campus
York University - Glendon Campus
Columbia College - Main Campus (GE)
Coventry University Group (CU) - Scarborough Campus
DeMont Institute of Management & Technology - Dubai Campus
Global College Malta
Manukau Institute of Technology - Otara Campus
SCU College
St. Lawrence College - Cornwall Campus
University of Bedfordshire via 2+2 Green River College
University of Cincinnati - UC Clermont Campus
Centennial College - Story Arts Centre Campus (CI)
Griffith College - Cork Campus - India
La Trobe University - Shepparton Campus
Massachusetts College of Pharmacy and Health Sciences (MCPHS) University - Worcester Campus
OIEG Group - Mercy University - Manhattan Campus
Southern Cross University (Venture) - Sydney Campus
The University of British Columbia - Okanagan Campus (GE)
Toulouse Business School - Toulouse Campus
American College - Nicosia Campus
Bethesda University
Booth University College (CI)
British Columbia Institute of Technology - Downtown Campus
Castelldefels School of Social Sciences (C3S)
EduCo - Arbutus College - Vancouver Campus (GE)
Iowa State University via Green River College
LaSalle College - Barcelona Campus via LCI Network
Le Cordon Bleu - Australia
Le Cordon Bleu - Istanbul
Rocky Mountain College of Art + Design
SRH Universities - Hamburg Campus
Southern Cross University (Venture) - Brisbane Campus
Southern Oregon University via Kings Education
The Gilbert School via Kings Education
Training for Knowledge and Livelihood (TKL) College - Parramatta Campus Via AEN
UP Education - Yoobee College of Creative Innovation - Auckland City Road Campus
University of the West of England - Bristol - Glenside Campus
Up Education - Acknowledge Education - Melbourne Campus
Arizona State University via Green River College
Australian Vocational Training Academy
Baylor University Via Green River College
Bayswater Education
Centennial College - Ashtonbee Campus (CI)
ECE Engineering School
Eastern Institute of Technology - Auckland Campus
Fanshawe College - London Downtown Campus (GE)
Fleming College - Frost Campus (Lindsay)
GUS - Arden University - London Stratford Campus
INTO Group - George Mason University - Korea Campus
John von Neumann University via Budapest International College (BIC)
Northern College - Haileybury Campus
Obuda University via Budapest International College (BIC)
Raffles American School (K-12) - Thailand
SRH Universities - Leipzig Campus
SRH Universities - Munich Campus
Study Group - University of Huddersfield - London
UP Education - Yoobee College of Creative Innovation - Wellington Campus
University College Roosevelt via Green River College
University of California, Riverside via Green River College
Waikato Institute of Technology (Wintec) - Rotokauri Campus
Asia Pacific International College (APIC) - Melbourne Campus via Education Centre of Australia (ECA) Group
Asia Pacific International College (APIC) - Sydney Campus via Education Centre of Australia (ECA) Group
Barcelona Culinary Hub (BCH) via Grupo Planeta
Berlin School of Business and Innovation (BSBI) - Hamburg Campus Via Global University Systems (GUS)
Birmingham City University - City South Campus
Conestoga College - Reuter Drive Campus
ECA College via Education Centre of Australia (ECA)
Engineering Institute of Technology (EIT) - Perth campus
Escuela Superior de Diseño de Barcelona (ESDESIGN) via Grupo Planeta
Fresenius University of Applied Sciences - Berlin Campus
GUS - The University of Law - Bristol Campus
Greater Saskatoon Catholic Schools
Hub - University of Louisville
International School of Management - Munich Campus (Germany)
Kwantlen Polytechnic University - Civic Plaza Campus (CI)
Lambton College - Ottawa Campus (GE)
Le Cordon Bleu - Madrid
Lester B. Pearson School Board - Pearson Adult Career Centre (PACC) (CI)
Manukau Institute of Technology - Manukau Campus
NABA Nuova Accademia di Belle Arti - Rome
National Academy of Professional Studies - Sydney Campus Via AEN
Navitas Group - Western International College
Northeastern University - Vancouver Campus (CI)
Okanagan College - Vernon Campus (CI)
Raffles American School (K-12) - Malaysia
San Francisco State University via Green River
Shorelight Group - University of Illinois Springfield
University of Arizona via Green River
Up Education - Auckland Institute of Studies - St Helens Campus
Vancouver Film School
Victoria University - Sydney Campus Via Education Centre of Australia (ECA)
Victorian Institute of Technology (VIT) - Adelaide Campus
Victorian Institute of Technology (VIT) - Geelong Campus
Victorian Institute of Technology (VIT) - Melbourne Campus
Victorian Institute of Technology (VIT) - Sydney Campus
Wekerle International University
Benedictine University - Mesa Campus
Eastern Washington University via Green River College
Engineering Institute of Technology (EIT) - Melbourne Campus
English Path UK via GEDU
Federation University - Melbourne City Campus
INTO Manchester via INTO
Illinois Institute of Technology via Green River
Indiana University-Purdue University Indianapolis via Green River
International School of Management - Berlin Campus (Germany)
International School of Management - Dortmund Campus (Germany)
Le Cordon Bleu - Kuala Lumpur
Le Cordon Bleu - Mexico City
Modul University Vienna
National Academy of Professional Studies - Melbourne Campus Via AEN
Shorelight Group - Holy Cross College at Notre Dame
University of Chester - Wheeler Campus
University of Nevada, Las Vegas via Green River College
Wittenborg University of Applied Sciences - Amsterdam Campus
BPP Institute - Melbourne Campus
Berlin School of Business and Innovation - Barcelona Campus Via Global University Systems (GUS)
ENAE International Business School
ESCE International Business School
Embry - Riddle Aeronautical University via Green River College
English Language Academy at University of San Diego
Fairleigh Dickinson University via Green River College
Florida Institute of Technology via Green River College
Fresenius University of Applied Sciences - Cologne Campus
Future Skills Academy - Auckland International Campus
GUS - The University of Law - Nottingham Campus
Global University Systems (GUS) - Canadian College of Technology and Business (CCTB)
Global University Systems (GUS) - University of Niagara Falls Canada
GoElite - Goldey-Beacom College
Gonzaga University via Green River College
Hub - University of the Cumberlands
Johnson & Wales University via Green River College
Le Cordon Bleu - Thailand
Louis Riel School Division (CI)
Menzies Institute of Technology
Mohawk College - Stoney Creek Campus (CI)
Montana State University via Green River College
Navitas Group - ACAP University College - Sydney Campus
Northern Arizona University via Green River College
Northern College - Kirkland Lake Campus
OIEG Group - Lincoln Bishop University
Oregon State University via Green River College
Otago Polytechnic - Auckland Campus
Pacific Lutheran University via Green River College
Portland State University via Green River
Seattle Pacific University via Green River College
Southampton Solent University via QA Higher Education
Southern Cross University - Lismore Campus
University of Dunaujvaros via Budapest International College (BIC)
University of Nevada - Reno via Green River College
University of Oregon via Green River College
University of Tasmania - Melbourne Study Centre Via Education Centre of Australia (ECA)
University of Warwick (Foundation)
University of Washington, Bothell via Green River College
University of Washington, Tacoma via Green River College
Washington State University via Green River College
Webster University - St Antonio Campus
Western Washington University via Green River College
Whitworth University via Green River College
École de Management Appliqué via GEDU
Cégep de la Gaspésie et des Îles (GE)
EC English
Eastern Institute of Technology - Tairawhiti Campus
Georgian College - Owen Sound Campus
GoElite - Monroe University - Bronx Campus
GoElite - Monroe University - New Rochelle
GoElite - Monroe University - Saint Lucia
Hub - Campbellsville University - Louisville Campus
International School of Management - Frankfurt Campus (Germany)
International University of Monaco
Melbourne Polytechnic - Fairfield Campus
Navitas English - Perth campus
Navitas Group - ACAP University College - Melbourne Campus
New Era Institute
Okanagan College - Penticton Campus (CI)
Ozford Institute of Higher Education
Raffles Education Network - Italy
Regent College London
Saint George's University
Shorelight Group - Heriot-Watt University - Scottish Borders Campus
Shorelight Group - Pepperdine University
Simon Fraser University - Vancouver Campus (CI)
Southern Cross University - Coffs Harbour Campus
St. George International College
University College Dublin via Kaplan Singapore
University of Alberta - Augustana Campus (CI)
University of Calgary (Continuing Education) - Downtown Campus (CI)
University of Lethbridge - Calgary Campus
Vistula University - Gdańsk Campus
Asia Pacific International College (APIC) - Brisbane Campus via Education Centre of Australia (ECA) Group
Braemar College
Browns English Language School (South Asia and South East Asia)
CREA
EduCo - Acsenda School of Management (GE)
FOM University of Applied Sciences - Essen Campus
Fanshawe College - London Airport Campus (GE)
International School of Management - Hamburg Campus (Germany)
Kodolanyi Janos University via Budapest International College (BIC)
Le Cordon Bleu - Beirut Lebanon
Manukau Institute of Technology - TechPark Campus
Mohawk College - Institute for Applied Health Sciences at McMaster (IH) Campus (CI)
Raffles Education Network - China
Red River College Polytechnic - South Winnipeg Campus (CI)
Sports Management School (SMS) via Grupo Planeta
University of Tasmania - Sydney Campus Via Education Centre of Australia (ECA)
Up Education - New Zealand Tertiary College (NZTC) - Auckland Campus
Blyth Academy- Burlington
CBS University of Applied Sciences - Cologne Campus
Conestoga College - Milton - Parkhill Drive - Campus
Cégep de la Gaspésie et des Îles via Hermes Colleges Network (HCN)
English Path Canada via GEDU
English Path Malta via GEDU
Fanshawe College - St. Thomas-Elgin (Regional Campus) (GE)
IBERO via Grupo Planeta
Lester B. Pearson School Board - West Island Career Centre (CI)
Mohawk College - Mississauga Campus (CI)
Munich Business School, University of Applied Sciences
Navitas English - sydney campus
Navitas Group - Hawthorn-Melbourne
New European College
New Zealand Skills and Education College (NZSE) - Auckland CBD Campus
Okanagan College - Salmon Arm Campus (CI)
Pakenham Institute
RMIT University - Brunswick Campus
Raffles Education Network - Cambodia
SEGi College Kota Damansara via SEGi University and Colleges
Selkirk College - Castlegar Campus (CI)
Stirling University - Dubai Campus (UAE)
The Hotel School - Southern Cross University - Brisbane Campus
The Hotel School - Southern Cross University - Melbourne Campus
The Hotel School - Southern Cross University - Sydney Campus
Touro University via G2U
University Hub - St. Clair College - Windsor Campus
University of Greenwich - Avery hill Campus
Up Education - New Zealand Management Academies (NZMA) - Christchurch Campus
Up Education - New Zealand Management Academies (NZMA) - Hamilton Campus
American Collegiate Live via Shorelight
Assiniboine Community College - North Hill Campus (Brandon) (CI)
Barcelona Technology School
Birmingham City University - Margaret Street Campus
British Columbia Institute of Technology - Aerospace Technology Campus
California State University, Fullerton via Kings Education
Canadore College - Aviation Campus (CI)
Canning College
Conestoga College - Guelph Campus
Convoy International Secondary Academy
EURASIA Institute for International Education
Ellesmere College
Fanshawe College - Simcoe-Norfolk (Regional Campus) (GE)
Georgian College - Orangeville Campus
HEIP
Hotel Escuela Ecotur
Hub - Wayland Baptist University
Le Cordon Bleu - Manila
Memorial University of Newfoundland - Faculty of Engineering & Applied Sciences
Niagara University - Vaughan Campus
Northumbria University via Kaplan Singapore
Raffles Education Network - Indonesia
SRH Universities - Dresden Campus
SRH Universities - Hamm Campus
Sarina Russo Institute
Trent University - Durham GTA Advanced Learning Center
Universitat Carlemany (UCMA) via Grupo Planeta
University College of Business
University of California Riverside via University Study
University of Southampton - University Hospital Southampton Campus
Up Education - New Zealand Management Academies (NZMA) - Auckland Central Campus
Vancouver Institute of Media Arts (GE)
Victoria University - Brisbane Campus Via Education Centre of Australia (ECA)
York University - School of Continuing Studies (CI)
Alderson Elementary via Coquitlam School District
Algebra UC
Anmore Elementary via Coquitlam School District
Aspenwood Elementary via Coquitlam School District
Baker Drive Elementary School via Coquitlam School District
Barcelona Technology School (BTS) - Barcelona Campus (CI)
Birchland Elementary School via Coquitlam School District
Blakeburn Elementary School via Coquitlam School District
Blyth Academy- The Glebe
Bow Valley College Centre For Entertainment Arts
Bramblewood Elementary School via Coquitlam School District
Cape Horn Elementary School via Coquitlam School District
Castle Park Elementary School via Coquitlam School District
Cedar Drive Elementary School via Coquitlam School District
Central Community Elementary School via Coquitlam School District
Coquitlam River Elementary School via Coquitlam School District
Cotter School via GE International Schools
Cégep Marie-Victorin via Hermes Colleges (HCN)
Dignity Health Global Education
Eagle Ridge Elementary School via Coquitlam School District
Elite School of Beauty and Spa (Yoobee Colleges Limited) via UP Education
Embry-Riddle Aeronautical University Asia
Engineering Institute of Technology (EIT) - Brisbane Campus
English Path France via GEDU
Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Berlin Campus
Georgian College - South Georgian Bay Campus
Glen Elementary School via Coquitlam School District
Glenayre Elementary School via Coquitlam School District
Grand Sud, Upper School Tourism - Toulouse campus
Hampton Park Elementary School via Coquitlam School District
Harbour View Elementary School via Coquitlam School District
Hazel Trembath Elementary School via Coquitlam School District
Heritage Mountain Elementary School via Coquitlam School District
Herzing College - Montreal Campus (GE)
Higher Education Leadership Institute - Heli via Education Centre of Australia (ECA)
Hillside School via GE International
Hub - Anderson University
Irvine Elementary School via Coquitlam School District
James Park Elementary School via Coquitlam School District
Kilmer Elementary School via Coquitlam School District
Kwantlen Polytechnic University - Tech Campus (CI)
Lakehead University - Barrie STEM Hub
Le Cordon Bleu - Shanghai
Leigh Elementary School via Coquitlam School District
Lord Baden-Powell Elementary School via Coquitlam School District
Manhattan Institute of Management
Mary Hill Elementary School via Coquitlam School District
Matrix College of Management Technology and Healthcare Inc via Hermes College Network (HCN)
Meadowbrook Elementary School via Coquitlam School District
Miller Park Elementary School via Coquitlam School District
Moody Elementary School via Coquitlam School District
Mountain Meadows Elementary School via Coquitlam School District
Mountain View Elementary School via Coquitlam School District
Mundy Road Elementary School via Coquitlam School District
Nestor Elementary School via Coquitlam School District
New Zealand Skills and Education College (NZSE) - New Lynn Campus
Nova Scotia International Student Program
Panorama Heights Elementary via Coquitlam School District
Parkland Elementary School via Coquitlam School District
Pinetree Way Elementary School via Coquitlam School District
Pleasantside Elementary School via Coquitlam School District
Porter Street Elementary School via Coquitlam School District
R.C. MacDonald Elementary School via Coquitlam School District
Ranch Park Elementary School via Coquitlam School District
Riverview Park Elementary School via Coquitlam School District
Rochester Elementary School via Coquitlam School District
Roy Stibbs Elementary School via Coquitlam School District
SRH International College via Navitas
SRH Universities - Cologne Campus
Seaview Community School via Coquitlam School District
Stenberg College (GE)
The Hotel School - Southern Cross University - Perth Campus
The Northwest School via ABC Education Group
The University Of Winnipeg - Professional, Applied And Continuing Education (PACE) (GE)
The University of Manchester via INTO UK
Toulouse Business School - Paris Campus
Unitec Institute of Technology - Waitakere Campus
University of California, Riverside
University of Chester - University Centre Warrington
Up Education - Acknowledge Education - Perth Campus
Walton Elementary School via Coquitlam School District
Westwood Elementary School via Coquitlam School District
Assiniboine Community College - Parkland Campus (Dauphin) (CI)
Auckland University of Technology via UP International College
Birmingham City University - School of Jewellery
Bodwell High School
Christchurch College of English (CCEL)
Coventry University Group (CU London) - Greenwich
Cut Above Academy (Yoobee Colleges Limited) via UP Education
Ecole de Guerre Economique (EGE) via Grupo Planeta
Engineering Institute of Technology (EIT) - Online
English Path Dubai via GEDU
English Path Ireland via GEDU
Fresenius University of Applied Sciences - Idstein Campus
GUS - Canterbury Christ Church University - Medway Campus
George Brown Polytechnic (GBP) - Toronto Metropolitan University Campus (GE)
GlobalU - Global Banking School (GBS) - Malta Online
GoElite - New England College
Hub - Cumberland University
Hub - Purdue University Northwest - Hammond Campus
Instituto Superior Técnico (IST) via EIT InnoEnergy
International Graduate Institute (IGI)
International School of Management - Cologne Campus (Germany)
Justice Institute of British Columbia (JIBC)
Le Cordon Bleu - Wellington
LightPath New Zealand Schools - Northcote College
Massachusetts College of Pharmacy and Health Sciences (MCPHS) University - Manchester Campus
Melbourne Polytechnic - Epping Campus
Memorial University of Newfoundland - Faculty of Business Administration
New Zealand School of Tourism via UP Education
Paris Business Academy (PBA) - Paris Campus
Pinetree Secondary via Coquitlam School District
Quest Language Studies
SRH Universities - Furth Campus
St. Lawrence College - Brockville Campus
The Culinary Collective (New Zealand Management Academies) via UP Education
The University of Stirling - Ras Al-Khaimah Campus (GE)
Thomas More University via G2U
Trinity Western University - Richmond Campus
Universal College of Learning (UCOL) - Wairarapa Campus
Universitat Politècnica de Catalunya / Barcelona Tech (UPC) via EIT InnoEnergy
University of Auckland International College Via UP Education
University of Victoria - Gustavson School of Business, Executive Education Summer Programs
University of the Sunshine Coast - Adelaide Campus Via Education Centre of Australia (ECA)
Up Education - Acknowledge Education - Sydney Campus
Up Education - New Zealand Management Academies (NZMA) - Sylvia Park Campus
Victoria University of Wellington via UP International College
American Collegiate - DC via Shorelight
Aura Labor College
Aviron Quebec Technical College via Hermes Colleges Network (HCN)
Canadore College - West Parry Sound Campus (CI)
Centennial College - Downsview Campus (CI)
Concordia University St Paul via G2U
ESADE Business School via EIT InnoEnergy
FOM University of Applied Sciences - Munich Campus
Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Cologne Campus
Fanshawe College - London South Campus (GE)
Georgian College - Midland Campus
Hub - Adelphi University
Hub - Faulkner University
IBAT College Dublin via Global University Systems (GUS)
IHMGS International School
ILTexas Private High School - Arlington-Grand Prairie via GE Education
ILTexas Private High School - Garland via GE Education
ILTexas Private High School - Katy-Westpark via GE Education
ILTexas Private High School - Keller-Saginaw via GE Education
Idyllwild Arts Academy via ABC Education Group
International School of Management - Stuttgart Campus (Germany)
Karelia University of Applied Sciences - Wärtsilä Campus
Le Cordon Bleu - Kaohsiung
Lester B. Pearson School Board - Verdun Adult and Career Centre (CI)
Marianapolis Preparatory School via ABC Education Group
Masters Design Lab
Maumee Valley Country Day School via ABC Education Group
Mercedes College
New Zealand Institute of Sports (New Zealand Management Academies) via UP Education
North Broward Preparatory School via Nord Anglia Education
Phoenix Christian Preparatory School via GE International
SHEG Group - Cesar Ritz Colleges
SRH Universities - Stuttgart Campus
SolBridge International School of Business
The English Language Schools (ELSIS) via Education Centre of Australia (ECA)
The Orme School via ABC Education Group
The Village School via Nord Anglia Education
UP Education - International College of Hotel Management (ICHM)
University of Dundee - City Campus
University of Tasmania International Pathway College via UP Education
Up Education - Acknowledge Education - Brisbane Campus
Westcliff University - Dallas Campus
Westcliff University - Miami Campus
Westcliff University - Orlando Campus
Westcliff University - Santa Monica Campus
Western Sydney University, Surabaya
Wilfrid Laurier University - Milton Campus
Windermere Preparatory School via ABC Education Group
Windermere Preparatory School via Nord Anglia Education
Adelaide International School
Alexander Academy
Australian Performing Arts Conservatory via GEDU
Banting Middle via Coquitlam School District
Berlin School of Business and Innovation - Paris Campus Via Global University Systems (GUS)
British Columbia Institute of Technology - Annacis Island Campus
CASA College
Centennial Secondary via Coquitlam School District
Citadel Middle via Coquitlam School District
City University of Seattle
Como Lake Middle via Coquitlam School District
Conestoga College - Brantford Campus
Coquitlam College
Dr. Charles Best Secondary via Coquitlam School District
ELS Educational Services
Eagle Mountain Middle School via Coquitlam School District
Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Duren Campus
Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Waldshut Campus
Financia Business School - Paris Campus
Gleneagle Secondary via Coquitlam School District
GoElite - Bay Atlantic University
GoElite - California Institute of Advanced Management
GoElite - Sofia University - Costa Mesa
GoElite - Sofia University - Palo Alto
Grant High School via South Australia Government Schools
Grenoble INP Institute of Technology via EIT InnoEnergy
Heritage Woods Secondary via Coquitlam School District
Hillcrest Middle via Coquitlam School District
Kwayhquitlum Middle via Coquitlam School District
LCI Melbourne via LCI Network
Le Cordon Bleu - Ottawa
Lester B. Pearson School Board - Gordon Robertson Beauty Academy (CI)
Lester B. Pearson School Board - Pearson Electrotechnology Centre (CI)
Maillard Middle via Coquitlam School District
Maple Creek Middle via Coquitlam School District
Melbourne Polytechnic - Collingwood Campus
Melbourne Polytechnic - Northern Lodge at Eden Park Campus
Melbourne Polytechnic - Prahran Campus
Minnekhada Middle via Coquitlam School District
Mohawk College - Centre for Aviation Technology at Hamilton International Airport (YHM) (CI)
Montgomery Middle School via Coquitlam School District
Moody Middle School of the Arts via Coquitlam School District
Oxford International College Halifax via Oxford International Education Group
Oxford International Education Group - Universal Higher Education
Pitt River Middle via Coquitlam School District
Port Moody Secondary via Coquitlam School District
Riverside Secondary via Coquitlam School District
Scott Creek Middle via Coquitlam School District
Selkirk College - Tenth Street Campus (Nelson) (CI)
Shorelight Group - Heriot-Watt University - Orkney Campus
Stirling - Scotland Education Centre via INTO
Summit Middle via Coquitlam School District
Terry Fox Secondary via Coquitlam School District
The Chang School Of Continuing Education At Toronto Metropolitan University
The North Land Institute of Training
University of Wolverhampton - Springfield Campus
Up Education - New Zealand Management Academies (NZMA) - Wellington Campus
Whitireia and WelTec - Porirua Campus
York University - Markham Campus
Alternis Business School
American Collegiate - LA via Shorelight
Ascencia Valencia
Australia Institute of Business and Technology - International
Centennial College - Performing Arts Centre (CI)
City University in Canada - Calgary Campus (CI)
City University in Canada - Edmonton Campus (CI)
Conestoga College - Stratford Campus
Cégep Marie-Victorin
EF Academy New York via GE International
Eindhoven University of Technology (TU/e) via EIT InnoEnergy
FOM University of Applied Sciences - Berlin Campus
Fachhochschule des Mittelstands (FHM) University of Applied Sciences - Bielefeld Campus
Fanshawe College - Woodstock-Oxford (Regional Campus) (GE)
Fresenius University of Applied Sciences - Duesseldorf Campus
Fresenius University of Applied Sciences - Hamburg Campus
Fresenius University of Applied Sciences - Heidelberg Campus
Fresenius University of Applied Sciences - Munich Campus
GUS - The University of Law - Chester Campus
Global Higher Education
Global School for Entrepreneurship University of Applied Sciences
GlobalU - Global Business Studies (GBS) - Dubai Online
GoElite - Indiana Wesleyan University
Hub - Baptist University of Florida
Institut Polytechnique de Paris / École Polytechnique via EIT InnoEnergy
Katholieke Universiteit Leuven (KU Leuven) via EIT InnoEnergy
Lester B. Pearson School Board - John Killingbeck Pavillon Campus (CI)
Liston College via LightPath New Zealand Schools
London Metropolitan University via Education Centre of Australia (ECA)
Navitas Group - ACAP University College - Perth Campus
North Island College - Campbell River Campus (GE)
NorthTec - Whangarei Campus
Notre Dame High School via GE International Schools
Oxford International Pathway College - Oxford via Oxford International Education Group
Shorelight Group - University of California - Berkeley
South East Technological University - Dublin Campus
South University - Austin Campus
South University - Tampa Campus
Southern Institute of Technology - Telford Campus
The Newman School via ABC Education Group
Thompson Rivers University - Williams Lake
University for the Creative Arts - Rochester Campus
University of Canberra - Sydney Hills Campus Via Education Centre of Australia (ECA) Group
University of Chester - University Centre Birkenhead
University of Leicester
University of New Hampshire via University Study - Concord Campus
University of New Hampshire via University Study - Manchester Campus
University of Wolverhampton - Telford Campus
Université Paris Sciences et Lettres (PSL) via EIT InnoEnergy
Villanova Preparatory School via ABC Education Group
Whitireia and WelTec - Te Kahui Auaha Campus
Wilbraham and Monson Academy via ABC Education Group
AGH University of Science and Technology via EIT InnoEnergy
AHA International School via GE International
Admiral Farragut Academy via GE International Schools
Allendale Columbia School via GE International Schools
American Heritage School via GE International Schools
Andrews Osborne Academy via GE International
Annie Wright Schools via ABC Education Group
Annie Wright Schools via GE International Schools
Ara Institute of Canterbury - Timaru Campus
Archbishop Riordan High School via ABC Education Group
Archbishop Riordan High School via GE International Schools
Army and Navy Academy via GE International Schools
Ashley Hall via GE International Schools
Assiniboine Community College - Winnipeg Campus (CI)
Bakersfield Christian High School via GE International
Bath Spa University - London Campus
Belleview Christian School via GE International Schools
Ben Lippen School via GE International Schools
Berwick Academy via GE International Schools
Besant Hill School via ABC Education Group
Besant Hill School via GE International Schools
Bethlehem College via LightPath New Zealand Schools
Blue Ridge School via GE International Schools
Bolles Academy via ABC Education Group
Botany Downs Secondary College via LightPath New Zealand Schools
Buffalo Seminary (SEM) via GE International Schools
Burr and Burton Academy via GE International Schools
California Crosspoint Academy via GE International Schools
Camden Military Academy via GE International Schools
Canyonville Academy via GE International Schools
Capilano University - Squamish Campus
Carlisle School via GE International
Caucasus International University
Centennial College - Toronto Airways Inc - Canadian Flight Academy (CI)
Chaminade College Preparatory School via GE International Schools
Cheshire Academy via GE International Schools
Christchurch School via ABC Education Group
College of Health Sciences - Brisbane Campus Via Education Centre of Australia (ECA)
College of Health Sciences - Sydney Campus (Parramatta) Via Education Centre of Australia (ECA)
Colorado Rocky Mountain School via GE International
Community School of Naples via GE International
Concord Christian School via GE International Schools
Conestoga College - Milton - Steeles Avenue Campus
Cranbrook Schools via ABC Education Group
Cushing Academy via GE International Schools
Darlington School via GE International
Dunn School via GE International
ECA Professional Year via Education Centre of Australia (ECA)
Elite Preparatory Academy via ABC Education Group
English Language Institute - The University of Utah
Erie First Christian Academy via ABC Education Group
Erie First Christian Academy via GE International
Excelsior School via GE International
Fairfax Christian School via GE International
Fairleigh Dickinson University - Vancouver Campus (CI)
Fleming College - Haliburton Campus
Florida Prep via GE International
Forest Ridge School of the Sacred Heart via GE International Schools
Fork Union Military Academy via GE International Schools
Fountain Valley School of Colorado via GE International Schools
Fountain Valley School via ABC Education Group
Foxcroft Academy via GE International Schools
Fresenius University of Applied Sciences - Wiesbaden Campus
Fryeburg Academy via ABC Education Group
Fryeburg Academy via GE International Schools
Future Skills Academy - Manukau campus
GUS - The University of Law - Online
Garrison Forest School via GE International Schools
General McLane High School via GE International Schools
George Stevens Academy via GE International
Georgian College - Arch and Helen Brown Design and Digital Arts Centre
Gilmour Academy via GE International
GoElite - Concordia University Texas
Grand River Academy via GE International Schools
Green Bay High School via LightPath New Zealand Schools
Grier School via GE International
Hargrave Military Academy via GE International Schools
Hebron Academy via GE International Schools
Hilton Head Preparatory School via GE International Schools
Hoosac School via GE International Schools
Houghton Academy via ABC Education Group
Houghton Academy via GE International Schools
Hub - Saginaw Valley State University
Hub - Wittenberg University
Hyde School via ABC Education Group
Hyde School via GE International Schools
IMG Academy via GE International Schools
Idyllwild Arts Academy via GE International Schools
Indian Springs School via GE International Schools
International Business School - Vienna Campus
Iolani School via GE International Schools
John Bapst Memorial High School via GE International Schools
KASA High School
Kenston Forest School via GE International Schools
Kents Hill School via GE International
La Lumiere School via GE International Schools
La Salle College Preparatory via GE International Schools
Lake Mary Preparatory School via GE International
Lake Tahoe Prep School (Squaw Valley Academy) via GE International
Lancaster Mennonite School - Lancaster Campus via GE International
Layton Christian Academy via ABC Education Group
Layton Christian Academy via GE International
Lee Academy via GE International
Leeds Beckett University - Distance Learning
Life Prep Academy via ABC Education Group
Lincoln Academy via ABC Education Group
Lincoln Academy via GE International
Linden Hall via GE International Schools
Long Island Lutheran Middle & High School via GE International Schools
Long Trail School via GE International Schools
Lyndon Institute via GE International Schools
Léman Manhattan Preparatory School via ABC Education Group
Léman Manhattan Preparatory School via GE International Schools
Maine Central Institute via GE International Schools
Marianapolis Preparatory School via GE International Schools
Marine Military Academy via GE International
Maumee Valley Country Day School via GE International
Maur Hill - Mount Academy via ABC Education Group
Menaul School via GE International
Miller School of Albemarle via GE International Schools
Miss Hall's School via GE International Schools
Missouri Military Academy via GE International Schools
Mohawk College - Wentworth Heights - Schlegel (CI)
Monte Vista Christian School via GE International
Monterey Bay Academy via GE International Schools
Montverde Academy via ABC Education Group
Montverde Academy via GE International Schools
Navitas Group - ACAP University College - Adelaide Campus
Nebraska Christian Schools via GE International Schools
New Jersey United Christian Academy via GE International Schools
New Mexico Military Institute via GE International
New York Military Academy via GE International
Norfolk Christian Schools via GE International Schools
North Broward Prep School via ABC Education Group
North Broward Preparatory School via GE International Schools
North Cedar Academy via GE International
North Island College - Port Alberni Campus (GE)
Northern Academy of the Arts via GE International Schools
Northwood School via GE International Schools
Notre Dame High School via ABC Education Group
OIEG Group - Health Sciences University
Oak Grove School via GE International
Oak Hill Academy via GE International Schools
Oaks Christian School via GE International Schools
Oakwood Friends School via GE International Schools
Oldfields School via GE International Schools
Olds College of Agriculture and Technology - Edmonton Campus
Otago Polytechnic - Central Otago - Cromwell Campus
Oxford International Pathway College - London via Oxford International Education Group
Pakuranga College via LightPath New Zealand Schools
Paraparaumu College via LightPath New Zealand Schools
Perkiomen School via GE International Schools
Pilgrim School via GE International
Pioneer Academy via ABC Education Group
Pioneer Academy via GE International Schools
Politecnico di Torino (PoliTo) via EIT InnoEnergy
Putnam Science Academy via GE International Schools
Queen's School of English
Rabun Gap-Nacoochee School via GE International
Rancho Solano Preparatory School via GE International
Randolph-Macon Academy via GE International Schools
Red River College Polytechnic - Stevenson Campus (CI)
Rice Memorial High School via ABC Education Group
Rivermont Collegiate via GE International Schools
Riverstone International School via GE International Schools
Ross School via GE International Schools
SHEG Group - Culinary Arts Academy - Le Bouveret
Saint Andrew's School via GE International Schools
Saint Bede Academy via GE International Schools
Saint James School via GE International Schools
Saint John's Preparatory School via GE International Schools
Saint Stanislaus High School via GE International Schools
Salem Academy via GE International
San Domenico School via ABC Education Group
San Domenico School via GE International Schools
San Joaquin Memorial High School via GE International Schools
San Marcos Academy via GE International
Schools of the Sacred Heart & Berchmans Academy via GE International Schools
Selkirk College - Trail Campus (CI)
Shattuck-St. Mary's School via ABC Education Group
Shattuck-St. Mary's School via GE International Schools
Sheridan College - Hazel McCallion (Erin Meadows) Campus
Shorelight Group - College Readiness Academy Boston
Shorelight Group - Leadership and Career Academy Miami
Sierra Canyon School via GE International Schools
Solebury School via GE International Schools
South Hills Academy via ABC Education Group
South Kent School via GE International
South University - Savannah Campus
Southwestern Academy via GE International Schools
Springwood School via GE International Schools
St Dominic's College via LightPath New Zealand Schools
St. Andrew's-Sewanee School via GE International Schools
St. Andrews School via GE International
St. Croix Lutheran Academy via GE International
St. Francis High School via GE International Schools
St. John Bosco High School via GE International Schools
St. John's Preparatory School via GE International Schools
St. Johnsbury Academy via GE International
St. Margaret's School via GE International
St. Mary's School via GE International Schools
St. Stephen's Episcopal School via GE International Schools
St. Timothy's School (All Girls) via ABC Education Group
St. Timothy's School via GE International Schools
Stoneleigh-Burnham School via GE International Schools
Storm Kings School via GE International Schools
Stuart Hall School via GE International
Subiaco Academy via GE International Schools
TMI Episcopal via ABC Education Group
TMI Episcopal via GE International Schools
Tallulah Falls School via GE International Schools
Tauranga Boys' College via LightPath New Zealand Schools
Tauranga Girls' College via LightPath New Zealand Schools
The Athenian School via GE International Schools
The Bolles School via GE International
The Brook Hill School via GE International Schools
The Calverton School via GE International Schools
The Darrow School via GE International Schools
The Ethel Walker School via GE International Schools
The Gilbert School via GE International Schools
The Harvey School via GE International Schools
The International School of Minnesota via GE International Schools
The King's Academy via GE International
The King's Academy via GE International Schools
The Kiski School via GE International Schools
The Knox School via GE International
The Leelanau School via GE International Schools
The Linsly School via GE International Schools
The MacDuffie School via ABC Education Group
The MacDuffie School via GE International Schools
The Madeira School via GE International Schools
The Master's Academy via GE International Schools
The Newman School via GE International Schools
The Northwest School via GE International Schools
The Orme School via GE International Schools
The Oxford Academy via GE International
The Phelps School via GE International
The Stony Brook School via ABC Education Group
The Stony Brook School via GE International Schools
The Storm King School via ABC Education Group
The Vanguard School via GE International
The Village School via ABC Education Group
The Village School via GE International Schools
The White Mountain School via GE International School
The Whitestone Academy via ABC Education Group
The Winchendon School via ABC Education Group
The Winchendon School via GE International Schools
Thomas Jefferson School via GE International Schools
Thornton Academy via GE International Schools
Totino-Grace High School via GE International Schools
Toulouse Business School - Casablanca Campus
Trinity-Pawling School via GE International
Turlock Christian School via GE International
University Hub - St. Clair College - Chatham Campus
University of Chester - University Centre Shrewsbury
University of Cumbria (Distance Learning)
University of the West of Scotland - Paisley Campus
Université Paris Saclay via EIT InnoEnergy
UnternehmerTUM via EIT InnoEnergy
Up Education - Acknowledge Education - Adelaide Campus
Up Education - Healthcare Academy of New Zealand - Auckland Campus
Up Education - New Zealand Tertiary College (NZTC) - Christchurch Campus
Upland Country Day School via GE International Schools
Upper Columbia Academy via GE International
Valley Forge Military Academy and College via GE International Schools
Valley International Academy via GE International
Verde Valley School via ABC Education Group
Verde Valley School via GE International
Vermont Academy via GE International Schools
Villanova Preparatory School via GE International
Wasatch Academy via GE International
Washington Academy via ABC Education Group
Washington Academy via GE International Schools
Wellington College via LightPath New Zealand Schools
Wellington Girls College via LightPath New Zealand Schools
Wellington High School via LightPath New Zealand High Schools
West Nottingham Academy via GE International Schools
Westlake Boys High School via LightPath New Zealand Schools
Westlake Girls High School via LightPath New Zealand Schools
White Stone Academy via GE International Schools
Wilbraham & Monson Academy via GE International Schools
Williamsburg Christian Academy via GE International Schools
Windermere Preparatory School via GE International Schools
Wisconsin Lutheran High School via GE International Schools
Woodlands Academy of the Sacred Heart via GE International Schools
Woodside Priory School via GE International Schools
Woodstock Academy via GE International Schools
Woosong University
Worcester Academy via GE International Schools
`;

export type Institution = {
  id: string;
  name: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** One entry per line, blank lines skipped, exact duplicates removed. */
export const INSTITUTIONS: Institution[] = Array.from(
  new Set(
    RAW_INSTITUTIONS.split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  ),
).map((name) => ({ id: slugify(name), name }));

export const INSTITUTION_NAMES: string[] = INSTITUTIONS.map((i) => i.name);
