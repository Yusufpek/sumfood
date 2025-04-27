package com.fivesum.sumfood.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.GeocodingResult;
import org.springframework.stereotype.Service;

@Service
public class GoogleMapsService {

    private final GeoApiContext context;

    public GoogleMapsService(GeoApiContext context) {
        this.context = context;
    }

    public GeocodingResult[] geocodeAddress(String address) throws Exception {
        return GeocodingApi.geocode(context, address).await();
    }

    // Latitude, Longitude
    public double[] getLongLatByAddress(String address) throws Exception {
        GeocodingResult[] results = GeocodingApi.geocode(context, address).await();
        double[] geometry = new double[2];
        geometry[0] = results[0].geometry.location.lat;
        geometry[1] = results[0].geometry.location.lng;
        return geometry;
    }

}