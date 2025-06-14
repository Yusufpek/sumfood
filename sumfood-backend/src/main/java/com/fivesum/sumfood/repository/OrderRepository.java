package com.fivesum.sumfood.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.Customer;
import com.fivesum.sumfood.model.Restaurant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findById(Long id);

    List<Order> findByCustomer(Customer customer);

    List<Order> findByCustomerAndOrderStatus(Customer customer, OrderStatus status);

    List<Order> findByCustomerAndOrderStatusIn(Customer customer, Collection<OrderStatus> status);

    List<Order> findByOrderStatusIn(Collection<OrderStatus> status);

    List<Order> findByOrderStatus(OrderStatus status);

    List<Order> findByShoppingCartRestaurantAndOrderStatusIn(Restaurant restaurant, Collection<OrderStatus> status);
}
