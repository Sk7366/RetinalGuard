import React, { useEffect, useState } from 'react';
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
import { screeningApi } from '../api';
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
  const [centers, setCenters] = useState<ScreeningCenter[]>(() => MOCK_SCREENING_CENTERS);

  const cities = ['All', 'Bengaluru', 'Mumbai', 'New Delhi', 'Chennai', 'Hyderabad'];

  useEffect(() => {
    let isMounted = true;
    screeningApi.searchScreeningCenters(searchQuery).then((data) => {
      if (isMounted) {
        setCenters(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const filteredCenters = centers.filter((center) => {
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-stone-100 border border-stone-200/80 text-stone-700 text-xs font-semibold mb-3">
          <MapPin className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Community Access Directory</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900 tracking-tight">
          Find Retinal Screening Near You
        </h2>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Diabetic retinopathy often develops silently with no early symptoms. Regular non-invasive retinal imaging at a nearby community clinic or screening camp can detect early changes before vision is affected.
        </p>
      </div>

      {/* Search Bar & City Filters */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 sm:p-5 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your PIN code, city, or clinic name (e.g. 560060, Bengaluru)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
            />
          </div>

          <button
            onClick={handleUseLocation}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{userLocationDetected ? 'Location Detected (Bengaluru)' : 'Use My Location'}</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-stone-500 shrink-0 mr-1">Filter City:</span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCity === city
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
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
            className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Distance and Camp Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200/60">
                  <Navigation className="w-3 h-3 text-stone-500" />
                  ~{center.distanceKm} km away
                </span>

                {center.isCampActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <Tent className="w-3 h-3 text-amber-600" />
                    Camp Active
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 font-normal">Permanent Clinic</span>
                )}
              </div>

              {/* Title & Address */}
              <h3 className="font-serif font-semibold text-base text-stone-900 group-hover:text-[#EA580C] transition-colors leading-snug">
                {center.name}
              </h3>

              <p className="text-xs text-stone-600 mt-2 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  {center.address}, {center.city} — {center.pinCode}
                </span>
              </p>

              {/* Camp Dates if active */}
              {center.campDates && (
                <div className="mt-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{center.campDates}</span>
                </div>
              )}

              {/* Timings & Phone */}
              <div className="mt-3 space-y-1.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{center.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a href={`tel:${center.phone}`} className="hover:text-stone-900 font-mono">
                    {center.phone}
                  </a>
                </div>
              </div>

              {/* Services Badges */}
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {center.services.map((srv, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200/70 text-stone-700 font-medium"
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setBookingCenter(center);
                  setBookingConfirmed(false);
                }}
                className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-[#EA580C] text-white hover:bg-[#C2410C] transition-colors shadow-2xs"
              >
                Inquire / Book Slot
              </button>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  center.name + ', ' + center.city
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                title="Open Google Maps Directions"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-6">
          <MapPin className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-900">No screening centers found</h3>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search query or selecting "All" cities.
          </p>
        </div>
      )}

      {/* Booking / Inquiry Modal Dialog */}
      {bookingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150">
            {!bookingConfirmed ? (
              <div>
                <div className="flex items-center gap-2 text-[#EA580C] mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Community Screening Inquiry
                  </span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-stone-900">
                  {bookingCenter.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Non-invasive retinal photograph takes less than 5 minutes. No eye drops required for non-mydriatic screening.
                </p>

                <div className="my-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5 text-stone-800">
                  <div>
                    <span className="text-stone-500 font-medium">Operating hours:</span> {bookingCenter.hours}
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Helpline:</span> {bookingCenter.phone}
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Address:</span> {bookingCenter.address}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-800 block mb-1">
                      Patient Name / Initials
                    </label>
                    <input
                      type="text"
                      defaultValue="Diabetic Screening Participant"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 focus:bg-white bg-stone-50/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-stone-800 block mb-1">
                      Contact Phone (for SMS confirmation)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-stone-400 focus:bg-white bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2.5">
                  <button
                    onClick={() => setBookingCenter(null)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setBookingConfirmed(true)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#EA580C] text-white hover:bg-[#C2410C] transition-colors shadow-2xs"
                  >
                    Confirm Demo Booking
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-semibold text-stone-900">
                  Screening Slot Request Registered
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Your appointment request for <strong>{bookingCenter.name}</strong> has been logged in simulated demonstration mode. In a production deployment, an SMS token with queue timing is dispatched to the participant.
                </p>

                <div className="mt-5 flex gap-2 justify-center">
                  <button
                    onClick={() => setBookingCenter(null)}
                    className="py-2 px-4 rounded-xl text-xs font-semibold bg-stone-100 border border-stone-200 text-stone-800 hover:bg-stone-200 transition-colors"
                  >
                    Close
                  </button>
                  {onStartDemoScreening && (
                    <button
                      onClick={() => {
                        setBookingCenter(null);
                        onStartDemoScreening();
                      }}
                      className="py-2 px-4 rounded-xl text-xs font-semibold bg-[#EA580C] hover:bg-[#C2410C] text-white flex items-center gap-1.5 transition-colors shadow-2xs"
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
