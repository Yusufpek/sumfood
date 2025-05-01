package com.fivesum.sumfood.dto.requests;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fivesum.sumfood.model.enums.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourierRegistrationRequest extends CustomerRegistrationRequest {
    private String driverLicenceId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private Date birthDate;

    private VehicleType vehicleType;
}