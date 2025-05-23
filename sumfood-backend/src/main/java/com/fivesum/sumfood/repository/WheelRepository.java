package com.fivesum.sumfood.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fivesum.sumfood.model.Restaurant;
import com.fivesum.sumfood.model.Wheel;

@Repository
public interface WheelRepository extends JpaRepository<Wheel, Long> {
    Optional<List<Wheel>> findByRestaurant(Restaurant restaurant);
}
