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
import { useTranslation } from '../i18n/I18nContext';
import { ScreeningBookingFlow } from './ScreeningBookingFlow';

interface FindScreeningSectionProps {
  onStartDemoScreening?: () => void;
}

export const FindScreeningSection: React.FC<FindScreeningSectionProps> = ({
  onStartDemoScreening,
}) => {
  const { t } = useTranslation();
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
          <MapPin className="w-3.5 h-3.5 text-[#F05A28]" />
          <span>{t('commAccessDirectory', 'Community Access Directory')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900 tracking-tight">
          {t('findScreeningTitle', 'Find Retinal Screening Near You')}
        </h2>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          {t('findScreeningSubtitle', 'Diabetic retinopathy often develops silently with no early symptoms. Regular non-invasive retinal imaging at a nearby community clinic or screening camp can detect early changes before vision is affected.')}
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
              placeholder={t('searchPinPlaceholder', 'Enter your PIN code, city, or clinic name (e.g. 560060, Bengaluru)...')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-colors"
            />
          </div>

          <button
            onClick={handleUseLocation}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-[#F05A28]" />
            <span>{userLocationDetected ? t('locationDetected', 'Location Detected (Bengaluru)') : t('useMyLocation', 'Use My Location')}</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-stone-500 shrink-0 mr-1">{t('filterCity', 'Filter City:')}</span>
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
              {city === 'All' ? t('cityAll', 'All') : city}
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
                  ~{center.distanceKm} {t('kmAway', 'km away')}
                </span>

                {center.isCampActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <Tent className="w-3 h-3 text-amber-600" />
                    {t('campActive', 'Camp Active')}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 font-normal">{t('permanentClinic', 'Permanent Clinic')}</span>
                )}
              </div>

              {/* Title & Address */}
              <h3 className="font-serif font-semibold text-base text-stone-900 group-hover:text-[#F05A28] transition-colors leading-snug">
                {t(center.name, center.name)}
              </h3>

              <p className="text-xs text-stone-600 mt-2 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span>
                  {t(center.address, center.address)}, {t(center.city, center.city)} — {center.pinCode}
                </span>
              </p>

              {/* Camp Dates if active */}
              {center.campDates && (
                <div className="mt-2.5 p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span>{t(center.campDates, center.campDates)}</span>
                </div>
              )}

              {/* Timings & Phone */}
              <div className="mt-3 space-y-1.5 text-xs text-stone-600 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t(center.hours, center.hours)}</span>
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
                    {t(srv, srv)}
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
                className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold bg-[#F05A28] text-white hover:bg-[#D84818] transition-colors shadow-2xs"
              >
                {t('inquireBookSlot', 'Inquire / Book Slot')}
              </button>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  center.name + ', ' + center.city
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                title={t('openGoogleMapsDirections', 'Open Google Maps Directions')}
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
          <h3 className="text-sm font-semibold text-stone-900">{t('noCentersFound', 'No screening centers found')}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {t('noCentersSub', 'Try adjusting your search query or selecting "All" cities.')}
          </p>
        </div>
      )}

      {/* Booking / Inquiry Modal Dialog with scalable booking flow */}
      {bookingCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1C1719] rounded-3xl max-w-4xl w-full border border-stone-200 dark:border-[#382E32] shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setBookingCenter(null)}
              className="absolute top-5 right-5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold transition-colors z-10 cursor-pointer"
            >
              ✕ Close
            </button>
            <ScreeningBookingFlow
              initialCenterId={bookingCenter.id}
              onNavigateToScreening={() => {
                setBookingCenter(null);
                if (onStartDemoScreening) onStartDemoScreening();
              }}
              onClose={() => setBookingCenter(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
