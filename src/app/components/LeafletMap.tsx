"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import SocketIO, { socketIo } from "@/app/utils/socketIo";

const myIcon = L.icon({
  iconUrl: "https://cdn-icons-png.freepik.com/512/6615/6615039.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [-3, -76],
});

export default function Map() {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    [key: string]: L.Marker;
  }>({});

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socketIo.emit("send-location", { latitude, longitude });
        },
        (error) => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }

    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([0, 0], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Aniket Rouniyar",
      }).addTo(mapRef.current);
    }

    SocketIO(`${process.env.NEXT_PUBLIC_BASE_URL}`);

    socketIo.on("connect", async () => {
      console.log("Connected to Socket.IO server ", socketIo.id);
    });

    socketIo.on(
      "receive-location",
      (data: { id: string; latitude: number; longitude: number }) => {
        console.log(data);
        const { id, latitude, longitude } = data;
        mapRef.current?.setView([latitude, longitude]);

        if (markersRef.current[id]) {
          markersRef.current[id].setLatLng([latitude, longitude]);
        } else {
          const marker = L.marker([latitude, longitude], {
            icon: myIcon,
          }).addTo(mapRef.current!);
          markersRef.current[id] = marker;
        }
        console.log(markersRef.current);
      }
    );

    socketIo.on("user-disconnected", (id: string) => {
      if (markersRef.current[id]) {
        mapRef.current?.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });
    return () => {
      if (socketIo) {
        socketIo.disconnect();
      }

      socketIo.off("connect");

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div id="map" style={{ height: "100vh", width: "100%" }}></div>
    </>
  );
}
