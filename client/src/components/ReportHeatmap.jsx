import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ReportHeatmap({ reports }) {
  // Default Center (Cameroon)
  const position = [4.5, 11.5];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-700 shadow-xl relative z-0">
      <MapContainer
        center={position}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        {/* Dark Mode Map Tiles (CartoDB Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {reports.map((report) => {
          // Only plot if we have valid GPS
          if (report.location && report.location.lat !== 0) {
            return (
              <CircleMarker
                key={report._id}
                center={[report.location.lat, report.location.lng]}
                pathOptions={{
                  color: report.isPriority ? "red" : "#3b82f6", // Red for Priority, Blue for Normal
                  fillColor: report.isPriority ? "#ef4444" : "#60a5fa",
                  fillOpacity: 0.6,
                  radius: 10, // Size of dot
                }}
              >
                <Popup>
                  <div className="text-black text-xs">
                    <strong>{report.category}</strong> <br />
                    {new Date(report.createdAt).toLocaleDateString()} <br />
                    <span className="italic">
                      "{report.description.substring(0, 30)}..."
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
