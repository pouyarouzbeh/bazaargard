import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
export default function AreaMap({ areas }) {
  const container = useRef(null);
  useEffect(() => {
    let active = true;
    const map = L.map(container.current, {
      scrollWheelZoom: false,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    }).setView([35.7, 51.41], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19,
    }).addTo(map);
    const bounds = [];
    areas.forEach((a, i) => {
      bounds.push([a.lat, a.lon]);
      const box = document.createElement("div");
      box.dir = "rtl";
      const title = document.createElement("b");
      title.textContent = a.name;
      const text = document.createElement("p");
      text.textContent = "موقعیت تقریبی ناحیه";
      box.append(title, text);
      L.marker([a.lat, a.lon], {
        icon: L.divIcon({
          className: "area-pin",
          html: "<span>" + String(i + 1) + "</span>",
          iconSize: [32, 38],
          iconAnchor: [16, 38],
        }),
      })
        .bindPopup(box)
        .addTo(map);
    });
    if (bounds.length)
      map.fitBounds(bounds, { padding: [25, 25], maxZoom: 14, animate: false });
    const resize = new ResizeObserver(() => {
      if (active) map.invalidateSize({ pan: false });
    });
    resize.observe(container.current);
    return () => {
      active = false;
      resize.disconnect();
      map.stop();
      map.remove();
    };
  }, [areas]);
  return (
    <div>
      <div
        className="area-map"
        ref={container}
        role="region"
        aria-label="نقشه نقاط تقریبی نواحی خرید"
      />
    </div>
  );
}
