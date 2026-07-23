/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchengenCountry } from '../types';

export const COUNTRY_IMAGE_FALLBACK = 'https://placehold.co/300x200?text=Country';

export const SCHENGEN_COUNTRIES: SchengenCountry[] = [
  {
    id: 'austria',
    name: 'Austria',
    code: 'AT',
    capital: 'Vienna',
    entryDate: '1997-12-28',
    description: 'Famous for its imperial history, baroque architecture, and breathtaking mountain landscapes.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Wien_-_Schloss_Sch%C3%B6nbrunn.JPG/1280px-Wien_-_Schloss_Sch%C3%B6nbrunn.JPG'
  },
  {
    id: 'belgium',
    name: 'Belgium',
    code: 'BE',
    capital: 'Brussels',
    entryDate: '1995-03-26',
    description: 'Known for medieval towns, Renaissance architecture, and as the headquarters of the EU.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Grand-Place%2C_Brussels_-_panorama%2C_June_2018.jpg/1280px-Grand-Place%2C_Brussels_-_panorama%2C_June_2018.jpg'
  },
  {
    id: 'croatia',
    name: 'Croatia',
    code: 'HR',
    capital: 'Zagreb',
    entryDate: '2023-01-01',
    description: 'Beautiful Adriatic coastline, over a thousand islands, and historic Roman ruins.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg/1280px-The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg'
  },
  {
    id: 'czechia',
    name: 'Czechia',
    code: 'CZ',
    capital: 'Prague',
    entryDate: '2007-12-21',
    description: 'Boasting fairytale castles, historic old towns, and world-renowned local beers.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg/1280px-Prague_07-2016_view_from_Lesser_Town_Tower_of_Charles_Bridge_img3.jpg'
  },
  {
    id: 'denmark',
    name: 'Denmark',
    code: 'DK',
    capital: 'Copenhagen',
    entryDate: '2001-03-25',
    description: 'A Nordic country linking Europe with Scandinavia, characterized by coastal islands and bridges.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/The_Nyhavn_Canal_3.jpg/1280px-The_Nyhavn_Canal_3.jpg'
  },
  {
    id: 'estonia',
    name: 'Estonia',
    code: 'EE',
    capital: 'Tallinn',
    entryDate: '2007-12-21',
    description: 'A Baltic nation with a well-preserved medieval capital and vast, pristine forests.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Old_Town_of_Tallinn%2C_Tallinn%2C_Estonia_-_panoramio_%2858%29.jpg/1280px-Old_Town_of_Tallinn%2C_Tallinn%2C_Estonia_-_panoramio_%2858%29.jpg'
  },
  {
    id: 'finland',
    name: 'Finland',
    code: 'FI',
    capital: 'Helsinki',
    entryDate: '2001-03-25',
    description: 'The happiest country in the world, famous for its thousands of lakes and northern lights.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Kirkko3.png/1280px-Kirkko3.png'
  },
  {
    id: 'france',
    name: 'France',
    code: 'FR',
    capital: 'Paris',
    entryDate: '1995-03-26',
    description: 'A global center for art, fashion, gastronomy, and culture with iconic monuments.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/1280px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg'
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    capital: 'Berlin',
    entryDate: '1995-03-26',
    description: 'A European powerhouse with rich history, dense forests, and lively, modern cities.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/1280px-Brandenburger_Tor_abends.jpg'
  },
  {
    id: 'greece',
    name: 'Greece',
    code: 'GR',
    capital: 'Athens',
    entryDate: '2000-01-01',
    description: 'The cradle of Western civilization, with sun-bleached ancient temples and stunning islands.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg/1280px-1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg'
  },
  {
    id: 'hungary',
    name: 'Hungary',
    code: 'HU',
    capital: 'Budapest',
    entryDate: '2007-12-21',
    description: 'Famed for thermal baths, grand architecture, and the beautiful Danube River dividing its capital.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Hungarian_Parliament_Building_from_across_the_Danube%2C_2025-01-11.jpg/1280px-Hungarian_Parliament_Building_from_across_the_Danube%2C_2025-01-11.jpg'
  },
  {
    id: 'iceland',
    name: 'Iceland',
    code: 'IS',
    capital: 'Reykjavik',
    entryDate: '2001-03-25',
    description: 'A land of volcanic fields, geysers, hot springs, and massive glaciers.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Hallgrimskirkja_mai_2026.jpg/1280px-Hallgrimskirkja_mai_2026.jpg'
  },
  {
    id: 'italy',
    name: 'Italy',
    code: 'IT',
    capital: 'Rome',
    entryDate: '1997-10-26',
    description: 'Renowned for its culinary arts, historical landmarks, Renaissance masterpieces, and fashion.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg'
  },
  {
    id: 'latvia',
    name: 'Latvia',
    code: 'LV',
    capital: 'Riga',
    entryDate: '2007-12-21',
    description: 'A country with sweeping Baltic beaches, deep green pine forests, and rich art nouveau architecture.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Riga_%2833844464828%29.jpg/1280px-Riga_%2833844464828%29.jpg'
  },
  {
    id: 'liechtenstein',
    name: 'Liechtenstein',
    code: 'LI',
    capital: 'Vaduz',
    entryDate: '2011-12-19',
    description: 'A tiny Alpine principality located between Switzerland and Austria.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Liechtenstein_asv2022-10_img22_Vaduz_Schloss.jpg/1280px-Liechtenstein_asv2022-10_img22_Vaduz_Schloss.jpg'
  },
  {
    id: 'lithuania',
    name: 'Lithuania',
    code: 'LT',
    capital: 'Vilnius',
    entryDate: '2007-12-21',
    description: 'Rich Baltic culture, dunes on the Curonian Spit, and beautiful baroque churches.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Gedimino_kalnas_120.jpg/1280px-Gedimino_kalnas_120.jpg'
  },
  {
    id: 'luxembourg',
    name: 'Luxembourg',
    code: 'LU',
    capital: 'Luxembourg City',
    entryDate: '1995-03-26',
    description: 'A small European country with spectacular castles, deep valleys, and a highly advanced economy.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Burg_Vianden%2C_Luxemburg.jpg/1280px-Burg_Vianden%2C_Luxemburg.jpg'
  },
  {
    id: 'malta',
    name: 'Malta',
    code: 'MT',
    capital: 'Valletta',
    entryDate: '2007-12-21',
    description: 'An archipelago in the central Mediterranean with historic fortresses, temples, and clear waters.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/St_John%27s_Co-Cathedral%2C_Valletta_001.jpg/1280px-St_John%27s_Co-Cathedral%2C_Valletta_001.jpg'
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    code: 'NL',
    capital: 'Amsterdam',
    entryDate: '1995-03-26',
    description: 'Famous for flat canal landscapes, vibrant tulip fields, windmills, and progressive culture.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg/1280px-South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg'
  },
  {
    id: 'norway',
    name: 'Norway',
    code: 'NO',
    capital: 'Oslo',
    entryDate: '2001-03-25',
    description: 'Famous for its deep fjords, glaciers, snowy peaks, and Viking heritage.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/1280px-Geirangerfjord_.jpg'
  },
  {
    id: 'poland',
    name: 'Poland',
    code: 'PL',
    capital: 'Warsaw',
    entryDate: '2007-12-21',
    description: 'Rich history, historic brick castles, diverse natural parks, and warm hospitality.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Wawel_%284%29.jpg/1280px-Wawel_%284%29.jpg'
  },
  {
    id: 'portugal',
    name: 'Portugal',
    code: 'PT',
    capital: 'Lisbon',
    entryDate: '1995-03-26',
    description: 'Maritime exploration history, world-renowned beaches, pastel architecture, and Fado music.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Bel%C3%A9m_Tower_in_Lisbon%2C_Portugal.jpg/1280px-Bel%C3%A9m_Tower_in_Lisbon%2C_Portugal.jpg'
  },
  {
    id: 'slovakia',
    name: 'Slovakia',
    code: 'SK',
    capital: 'Bratislava',
    entryDate: '2007-12-21',
    description: 'Beautiful Tatra mountains, deep caves, folk architecture, and a quiet medieval charm.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Slovakia_bratislava.jpg/1280px-Slovakia_bratislava.jpg'
  },
  {
    id: 'slovenia',
    name: 'Slovenia',
    code: 'SI',
    capital: 'Ljubljana',
    entryDate: '2007-12-21',
    description: 'Known for its pristine green mountains, Lake Bled, ski resorts, and thermal spas.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Lake_Bled_from_the_Mountain.jpg/1280px-Lake_Bled_from_the_Mountain.jpg'
  },
  {
    id: 'spain',
    name: 'Spain',
    code: 'ES',
    capital: 'Madrid',
    entryDate: '1995-03-26',
    description: 'Lively culture, flamenco dance, tapas cuisine, diverse scenery, and gorgeous sunny beaches.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/SF_maig_2_cropped.jpg/1280px-SF_maig_2_cropped.jpg'
  },
  {
    id: 'sweden',
    name: 'Sweden',
    code: 'SE',
    capital: 'Stockholm',
    entryDate: '2001-03-25',
    description: 'A Scandinavian nation of thousands of coastal islands, boreal forests, and clean design culture.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Gamla_stan_September_2014_01.jpg/1280px-Gamla_stan_September_2014_01.jpg'
  },
  {
    id: 'switzerland',
    name: 'Switzerland',
    code: 'CH',
    capital: 'Bern',
    entryDate: '2008-12-12',
    description: 'A mountainous Central European country, home to numerous lakes, villages and high Alps peaks.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Matterhorn_from_Domh%C3%BCtte_-_2.jpg/1280px-Matterhorn_from_Domh%C3%BCtte_-_2.jpg'
  }
];

export function getCountryByName(countryName: string): SchengenCountry | undefined {
  return SCHENGEN_COUNTRIES.find(country => country.name.toLowerCase() === countryName.toLowerCase());
}

export function getCountryImageByName(countryName: string, fallback: string = COUNTRY_IMAGE_FALLBACK): string {
  return getCountryByName(countryName)?.image || fallback;
}

export function isSchengenCountry(countryName: string): boolean {
  return SCHENGEN_COUNTRIES.some(c => c.name.toLowerCase() === countryName.toLowerCase());
}

