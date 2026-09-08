import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Search,
  Sparkles,
  Tent,
} from 'lucide-react';
import { MOCK_SCREENING_CENTERS } from '../mock/mockData';
import { ScreeningCenter } from '../types';

interface FindScreeningSectionProps {
  onStartDemoScreening?: () => void;
}

export const FindScreeningSection: React.FC<FindScreeningSectionProps> = ({
  onStartDemoScreening,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [userLocationDetected, setUserLocationDetected] = useState<boolean>(false);
  const [bookingCenter, setBookingCenter] = useState<ScreeningCenter | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  const cities = ['All', 'Bengaluru', 'Mumbai', 'New Delhi', 'Chennai', 'Hyderabad'];

  const filteredCenters = MOCK_SCREENING_CENTERS.filter((center) => {
    const matchesCity = selectedCity === 'All' || center.city === selectedCity;
    const matchesQuery =
      searchQuery === '' ||
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.pinCode.includes(searchQuery) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesQuery;
  });

  const handleUseLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setUserLocationDetected(true);
          setSelectedCity('Bengaluru'); // Default closest simulated cluster
        },
        () => {
          // Fallback to Bengaluru
          setUserLocationDetected(true);
          setSelectedCity('Bengaluru');
        }
      );
    } else {
      setUserLocationDetected(true);
      setSelectedCity('Bengaluru');
    }
  };

  return (
    <div id="find-screening" className="py-8">
      {/* Header */}
      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] text-xs font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Community Access Directory</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E2628] tracking-tight">
          Find Retinal Screening Near You
        </h2>
        <p className="text-sm text-[#6E5C5F] mt-2 leading-relaxed">
          Diabetic retinopathy often develops silently with no early symptoms. Regular non-invasive retinal imaging at a nearby community clinic or screening camp can detect early changes before vision is affected.
        </p>
      </div>

      {/* Search Bar & City Filters */}
      <div className="bg-white rounded-2xl border border-[#EFE4DC] p-4 sm:p-5 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6E5C5F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your PIN code, city, or clinic name (e.g. 560060, Bengaluru)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EFE4DC] bg-[#FFFDFB] text-xs sm:text-sm text-[#2E2628] placeholder-[#9E8D91] focus:outline-none focus:border-[#EA580C]"
            />
          </div>

          <button
            onClick={handleUseLocation}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] text-xs font-semibold text-[#C2410C] hover:bg-[#FFEDD5] transition-colors shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{userLocationDetected ? 'Location Detected (Bengaluru)' : 'Use My Location'}</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#EFE4DC] overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-[#6E5C5F] shrink-0 mr-1">Filter City:</span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCity === city
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white shadow-xs'
                  : 'bg-[#FAF8F6] text-[#6E5C5F] hover:text-[#2E2628] border border-[#EFE4DC]'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCenters.map((center) => (
          <div
            key={center.id}
            className="bg-white rounded-2xl border border-[#EFE4DC] p-5 shadow-xs hover:border-[#EA580C] transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Distance and Camp Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6E5C5F] bg-[#FAF8F6] px-2.5 py-1 rounded-md border border-[#EFE4DC]">
                  <Navigation className="w-3 h-3 text-[#EA580C]" />
                  ~{center.distanceKm} km away
                </span>

                {center.isCampActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BE185D] bg-[#FDF2F8] px-2.5 py-1 rounded-full border border-[#FBCFE8]">
                    <Tent className="w-3 h-3 text-[#DB2777]" />
                    Camp Active
                  </span>
                ) : (
                  <span className="text-[11px] text-[#6E5C5F] font-medium">Permanent Clinic</span>
                )}
              </div>

              {/* Title & Address */}
              <h3 className="font-serif font-bold text-base text-[#2E2628] group-hover:text-[#EA580C] transition-colors leading-snug">
                {center.name}
              </h3>

              <p className="text-xs text-[#6E5C5F] mt-2 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                <span>
                  {center.address}, {center.city} — {center.pinCode}
                </span>
              </p>

              {/* Camp Dates if active */}
              {center.campDates && (
                <div className="mt-2.5 p-2 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-[11px] text-[#C2410C] flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{center.campDates}</span>
                </div>
              )}

              {/* Timings & Phone */}
              <div className="mt-3 space-y-1.5 text-xs text-[#6E5C5F] pt-3 border-t border-[#EFE4DC]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#6E5C5F]" />
                  <span>{center.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#6E5C5F]" />
                  <a href={`tel:${center.phone}`} className="hover:text-[#EA580C] font-mono">
                    {center.phone}
                  </a>
                </div>
              </div>

              {/* Services Badges */}
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {center.services.map((srv, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] font-medium"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-[#EFE4DC] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setBookingCenter(center);
                  setBookingConfirmed(false);
                }}
                className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white hover:opacity-95 transition-opacity"
              >
                Inquire / Book Slot
              </button>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  center.name + ', ' + center.city
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-[#EFE4DC] text-[#6E5C5F] hover:text-[#2E2628] hover:bg-[#FAF8F6] transition-colors"
                title="Open Google Maps Directions"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#EFE4DC] p-6">
          <MapPin className="w-8 h-8 text-[#9E8D91] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#2E2628]">No screening centers found</h3>
          <p className="text-xs text-[#6E5C5F] mt-1">
            Try adjusting your search query or selecting "All" cities.
          </p>
        </div>
      )}

      {/* Booking / Inquiry Modal Dialog */}
      {bookingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#EFE4DC] shadow-xl p-6">
            {!bookingConfirmed ? (
              <div>
                <div className="flex items-center gap-2 text-[#EA580C] mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Community Screening Inquiry
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#2E2628]">
                  {bookingCenter.name}
                </h3>
                <p className="text-xs text-[#6E5C5F] mt-1">
                  Non-invasive retinal photograph takes less than 5 minutes. No eye drops required for non-mydriatic screening.
                </p>

                <div className="my-4 p-3 rounded-xl bg-[#FAF8F6] border border-[#EFE4DC] text-xs space-y-1 text-[#2E2628]">
                  <div>
                    <span className="text-[#6E5C5F]">Operating hours:</span> {bookingCenter.hours}
                  </div>
                  <div>
                    <span className="text-[#6E5C5F]">Helpline:</span> {bookingCenter.phone}
                  </div>
                  <div>
                    <span className="text-[#6E5C5F]">Address:</span> {bookingCenter.address}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#2E2628] block mb-1">
                      Patient Name / Initials
                    </label>
                    <input
                      type="text"
                      defaultValue="Diabetic Screening Participant"
                      className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#2E2628] block mb-1">
                      Contact Phone (for SMS confirmation)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-lg border border-[#EFE4DC] text-xs text-[#2E2628] focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => setBookingCenter(null)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold border border-[#EFE4DC] text-[#6E5C5F] hover:bg-[#FAF8F6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white hover:opacity-95"
                  >
                    Confirm Demo Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#2E2628]">
                  Screening Slot Request Registered
                </h3>
                <p className="text-xs text-[#6E5C5F] mt-2 leading-relaxed">
                  Your appointment request for <strong>{bookingCenter.name}</strong> has been logged in simulated demonstration mode. In a production deployment, an SMS token with queue timing is dispatched to the participant.
                </p>

                <div className="mt-5 flex gap-2 justify-center">
                  <button
                    onClick={() => setBookingCenter(null)}
                    className="py-2 px-4 rounded-lg text-xs font-semibold bg-[#FAF8F6] border border-[#EFE4DC] text-[#2E2628] hover:bg-[#EFE4DC]"
                  >
                    Close
                  </button>
                  {onStartDemoScreening && (
                    <button
                      onClick={() => {
                        setBookingCenter(null);
                        onStartDemoScreening();
                      }}
                      className="py-2 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#EA580C] to-[#DB2777] text-white flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Try Demo Screening Now →</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
