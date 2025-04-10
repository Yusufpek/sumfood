package com.fivesum.sumfood.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.*;

import com.fivesum.sumfood.model.base.UserBase;
import com.fivesum.sumfood.model.enums.Role;
import com.fivesum.sumfood.model.enums.VehicleType;

import lombok.experimental.SuperBuilder;

@SuperBuilder
@Entity
@Table(name = "couriers")
public class Courier extends UserBase {

    @Column(nullable = false)
    private String driverLicenceId;

    @Column
    private Date birthDate;

    @Column
    private int totalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private boolean isValidated = false;

    @PrePersist
    public void prePersist() {
        setRole(Role.COURIER);
    }

    @Override
    public boolean isEnabled() {
        return isValidated;
    }

    // Relations
    @OneToMany(mappedBy = "courier", cascade = CascadeType.REMOVE)
    private List<Delivery> deliveries = new ArrayList<>();

}
