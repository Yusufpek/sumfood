package com.fivesum.sumfood.model;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.EntityBase;

import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;

@SuperBuilder
@Entity
@NoArgsConstructor
@Table(name = "address")
public class Address extends EntityBase {
    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String addressLine;

    @Column(nullable = true)
    private String addressLine2;

    @Column(nullable = false, length = 5)
    private String postalCode;

    @Column(nullable = true)
    private double longitude;

    @Column(nullable = true)
    private double latitude;

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}
