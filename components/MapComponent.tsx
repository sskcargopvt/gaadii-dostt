
import React, { useEffect, useRef } from 'react';

interface Coords {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  startPos: Coords;
  endPos: Coords;
  currentPosition?: Coords;
  isDraggable?: boolean;
  onPositionsChange?: (positions: { start: Coords; end: Coords }) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  startPos,
  endPos,
  currentPosition,
  isDraggable = false,
  onPositionsChange,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  // Using 'any' type for Google Maps objects to bypass missing type definitions in the environment
  const googleMapRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const endMarkerRef = useRef<any>(null);
  const truckMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    // Access google from window object safely to fix "Cannot find namespace 'google'" errors
    const google = (window as any).google;
    if (!mapRef.current || !google) return;

    // Initialize Map
    if (!googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: startPos,
        zoom: 12,
        mapId: 'gadi_dost_map_1',
        disableDefaultUI: false,
        zoomControl: true,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#7c93a3" }]
          }
        ]
      });

      // Initialize Polyline
      polylineRef.current = new google.maps.Polyline({
        path: [startPos, endPos],
        geodesic: true,
        strokeColor: '#f59e0b',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: googleMapRef.current,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
          offset: '0',
          repeat: '20px'
        }]
      });
    }

    // Handle Start Marker
    if (!startMarkerRef.current) {
      startMarkerRef.current = new google.maps.Marker({
        position: startPos,
        map: googleMapRef.current,
        draggable: isDraggable,
        title: 'Pickup',
        label: { text: 'P', color: 'white', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
          scale: 15,
        }
      });

      if (isDraggable) {
        startMarkerRef.current.addListener('dragend', () => {
          const newPos = startMarkerRef.current?.getPosition();
          if (newPos && onPositionsChange && endMarkerRef.current) {
            onPositionsChange({
              start: { lat: newPos.lat(), lng: newPos.lng() },
              end: { lat: endMarkerRef.current.getPosition()!.lat(), lng: endMarkerRef.current.getPosition()!.lng() }
            });
          }
        });
      }
    }

    // Handle End Marker
    if (!endMarkerRef.current) {
      endMarkerRef.current = new google.maps.Marker({
        position: endPos,
        map: googleMapRef.current,
        draggable: isDraggable,
        title: 'Dropoff',
        label: { text: 'D', color: 'white', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
          scale: 15,
        }
      });

      if (isDraggable) {
        endMarkerRef.current.addListener('dragend', () => {
          const newPos = endMarkerRef.current?.getPosition();
          if (newPos && onPositionsChange && startMarkerRef.current) {
            onPositionsChange({
              start: { lat: startMarkerRef.current.getPosition()!.lat(), lng: startMarkerRef.current.getPosition()!.lng() },
              end: { lat: newPos.lat(), lng: newPos.lng() }
            });
          }
        });
      }
    }

    // Handle Truck Marker (Current Position)
    if (currentPosition) {
      if (!truckMarkerRef.current) {
        truckMarkerRef.current = new google.maps.Marker({
          position: currentPosition,
          map: googleMapRef.current,
          title: 'Truck',
          icon: {
            url: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });
      } else {
        truckMarkerRef.current.setPosition(currentPosition);
      }
    }

    // Update markers and polyline when props change
    if (startMarkerRef.current) startMarkerRef.current.setPosition(startPos);
    if (endMarkerRef.current) endMarkerRef.current.setPosition(endPos);
    if (polylineRef.current) polylineRef.current.setPath([startPos, endPos]);

  }, [startPos, endPos, currentPosition, isDraggable, onPositionsChange]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
    />
  );
};

export default MapComponent;
