package ru.kata.spring.boot_security.demo.services;

import ru.kata.spring.boot_security.demo.entities.Role;

import java.util.Set;

public interface RoleService {

    public Set<Role> getAllRoles();

    public Role getRoleByName(String role);
}
