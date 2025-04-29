package com.fivesum.sumfood.repository;

import java.util.List;

import com.fivesum.sumfood.model.Order;
import com.fivesum.sumfood.model.enums.OrderStatus;
import com.fivesum.sumfood.model.Customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(Customer customer);

    List<Order> findByCustomerAndOrderStatus(Customer customer, OrderStatus status);
}
