import { setStorage, getStorage, userIcon } from "./helpers.js";
import { icons } from "./helpers.js";

// html elemanlarını cagırma
const form = document.querySelector("form");
const noteList = document.querySelector('ul')


// global degiskenler

let coords;
let notes = getStorage();
let markerLayer =[]
let map


 
// haritayı ekrana basan fonksiyon

function loadMap(coords) {
  map = L.map("map").setView(coords, 10);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // imleçleri tutacagımız ayrı katman olusturma
  markerLayer= L.layerGroup().addTo(map)

  // kulllanıcının konumuna imleç bas

  L.marker(coords,{icon:userIcon}).addTo(map)

  // localden gelen verileri ekrana bas

  renderNoteList(notes)

  //   harştadaki tıklanma olaylarını izle
  map.on("click", onMapClick);
}





// iptal butonuna tıklanırsa formu temizle ve kapat

form[3].addEventListener("click", ()=>{

    // formu temizle
    form.reset()
    // formu kapat
    form.style.display = "none"
})

// form gonderilirse yeni bir not olustur ve local storage a kaydet

form.addEventListener('submit', (e)=> {
    // 1) yenilemeyi engelle
    e.preventDefault()

    // 2) inputlardaki verilerden bir not objesi oluştur
const newNote= {
    id: new Date().getTime(),
    title: form[0].value,
    date: form[1].value,
    status: form[2].value,
    coords: coords,
}

//3) dizinin başına yeni not ekleme
notes.unshift(newNote)

// 4) notları listele
renderNoteList(notes)

// 5)local storage ı guncelle

setStorage(notes)

// 6)formu kapat

form.style.display= 'none'
form.reset()


})

// not için imleç katmanına bir imleç ekler
function renderMarker(note){
  console.log(note);
  L.marker(note.coords,{icon: icons[note.status]})
  // imleci katmana ekle
  .addTo(map)
  .bindPopup(note.title)
}

// ekrana notları basar

function renderNoteList(items){

// ÖNCEDEN EKLENENEN ELEMANLARI TEMİZLE
noteList.innerHTML = '' ;
markerLayer.clearLayers()


    // dizideki her bir obje için not kartı bas

items.forEach((note)=>{
    // li elemanı olustur

    const listEle = document.createElement('li')

    // data-id ekle

    listEle.dataset.id=note.id

    // içeriği belirle
    listEle.innerHTML = ` <div class="info">
              <p>${note.title}</p>
              <p>
                <span>Date</span>
                <span>${note.date}</span>
              </p>
              <p>
                <span>Status:</span>
                <span>${note.status}</span>
              </p>
            </div>
            <div class="icons">
                <i id="fly" class="bi bi-airplane-fill"></i>
                <i id="delete" class="bi bi-trash3-fill"></i>
            </div>
    `;

    // elemanı haritaya ekle
    renderMarker(note)


    // elemanı listeye ekle
    noteList.appendChild(listEle)
})
}



// kullanıcının konumunu alma
navigator.geolocation.getCurrentPosition(
  (e) => {
    // konumu alırsa calısacak fonksiyon succesCallBack konuma gider
    loadMap([e.coords.latitude, e.coords.longitude]);
  },
  // konumu alamazsa calısacak fonksiyon positionErrorCallBack :konum izni yoksa
  //   belirlenen noktya gider
  () => {
    loadMap([39.953925, 32.858552]);
  }
);

// haritadaki tıklanma olaylarında calısır

function onMapClick(e) {
  // tıklanan yerin konumuna erişme
coords = [e.latlng.lat, e.latlng.lng];
  // haritada bir yere tıklayınca formu göster
  form.style.display = "flex";
  // inputun ilkine focus ekle

  form[0].focus();
}

// silme ve ucus

noteList.addEventListener("click", (e)=>{

  // tıklanılan lemanın idsine erişme
  const found_id = e.target.closest("li").dataset.id
  console.log(found_id)

  if(e.target.id=== 'delete' && confirm('are you sure')){
    // idsini bildiğimizi elemanı diziden cıkar

    notes = notes.filter((note) => note.id != found_id)

    // lokali guncelle

    setStorage(notes)

    // ekranı güncelle
    renderNoteList(notes)
  }

  if(e.target.id === 'fly'){
    // idsini bildiğimiz bir elemanı dizidwki haline erişme

    const note = notes.find((note)=> note.id ==found_id)

    map.flyTo(note.coords)
  }
})