package com.fivesum.sumfood.model;

import java.util.Date;

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

    @PrePersist
    public void prePersist() {
        setRole(Role.COURIER);
    }
}
