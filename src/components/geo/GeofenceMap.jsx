import React, { useEffect, useMemo, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { renderToStaticMarkup } from 'react-dom/server';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

// Fix default marker icon paths for bundlers
// Remove image-based default icons; use a Lucide-based DivIcon instead
// L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const lucideMarkerIcon = L.divIcon({
  className: 'lucide-marker',
  html: renderToStaticMarkup(
    <div>
      <MapPin size={30} color="#ef4444" fill="#ef4444" />
    </div>
  ),
  iconSize: [30, 30],
  iconAnchor: [15, 30], // bottom center aligns with tip
});

const ClickToAdd = ({ onAdd }) => {
  useMapEvents({
    click(e) {
      if (typeof onAdd === 'function') onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const DraggableMarker = ({ index, position, onDragEnd }) => {
  const [pos, setPos] = useState(position);
  const markerRef = useRef(null);
  useEffect(() => setPos(position), [position]);
  return (
    <Marker
      ref={markerRef}
      position={pos}
      draggable
      icon={lucideMarkerIcon}
      eventHandlers={{
        dragend() {
          const m = markerRef.current;
          if (m) {
            const { lat, lng } = m.getLatLng();
            setPos({ lat, lng });
            if (typeof onDragEnd === 'function') onDragEnd(index, lat, lng);
          }
        },
      }}
    />
  );
};

const GeofenceMap = ({
  radiusMeters = 100,
  locations = [],
  onAddLocation,
  onMoveLocation,
}) => {
  const firstLoc = Array.isArray(locations) && locations.length > 0 ? locations[0] : null;
  const initialCenter = useMemo(() => {
    if (firstLoc) {
      const lat = Number(firstLoc.lat ?? firstLoc.latitude);
      const lng = Number(firstLoc.lng ?? firstLoc.longitude);
      return [lat, lng];
    }
    return [20.5937, 78.9629];
  }, [firstLoc]);

  // Geocoding state with debounce
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const [open, setOpen] = useState(false);

  const doGeocode = async (q) => {
    const qq = String(q || '').trim();
    if (!qq) { setResults([]); setOpen(false); return; }
    try {
      setSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(qq)}&format=json&addressdetails=1&limit=5&dedupe=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Geocode error', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doGeocode(query), 400);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  const handlePickResult = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (typeof onAddLocation === 'function') onAddLocation(lat, lng, item.display_name || '');
    setOpen(false);
  };

  const handleMapClickAdd = (lat, lng) => {
    if (typeof onAddLocation === 'function') onAddLocation(lat, lng, '');
  };

  const FitToMarker = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      if (position && Number.isFinite(position.lat) && Number.isFinite(position.lng)) {
        map.setView([position.lat, position.lng], map.getZoom());
      }
    }, [position, map]);
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="md:col-span-2 flex items-center gap-2">
          <Popover className="z-1000" open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Input
                placeholder="Search address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </PopoverTrigger>
            <PopoverContent className="w-[min(640px,90vw)] p-0 z-1000">
              <Command>
                <CommandInput placeholder="Type an address..." value={query} onValueChange={setQuery} />
                <CommandList>
                  <CommandEmpty>{searching ? 'Searching...' : 'No results found'}</CommandEmpty>
                  <CommandGroup heading="Addresses">
                    {results.map((r, i) => (
                      <CommandItem key={i} onSelect={() => handlePickResult(r)}>
                        {r.display_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center">
          <Label className="mr-2">Radius (m)</Label>
          <Input type="number" value={radiusMeters} disabled className="w-28" />
        </div>
      </div>
      <MapContainer center={initialCenter} zoom={14} style={{ height: 380, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToAdd onAdd={handleMapClickAdd} />
        {firstLoc && (() => {
          const lat = Number(firstLoc.lat ?? firstLoc.latitude);
          const lng = Number(firstLoc.lng ?? firstLoc.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return (
            <>
              <FitToMarker position={{ lat, lng }} />
              <DraggableMarker index={0} position={{ lat, lng }} onDragEnd={onMoveLocation} />
              <Circle center={{ lat, lng }} radius={Number(radiusMeters || 100)} pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.1 }} />
            </>
          );
        })()}
      </MapContainer>
      <p className="text-xs text-muted-foreground">Tip: Click to set marker. Drag to adjust. Radius border updates live.</p>
    </div>
  );
};

export default GeofenceMap;