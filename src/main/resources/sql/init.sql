CREATE TABLE users
(
    id       BIGINT AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(80)  NOT NULL,
    email    VARCHAR(50) UNIQUE,
    age      INT,
    PRIMARY KEY (id)
);

CREATE TABLE roles
(
    id   BIGINT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE users_roles
(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

INSERT INTO roles (name)
VALUES ('ROLE_USER'),
       ('ROLE_ADMIN');

INSERT INTO users (username, password, email, age)
VALUES ('user1', '$2a$12$l1ZREZH/Qo24CvQXmJ3shujNSB2UussLcFcj9ObcomShAheCnPETa', 'user1@gmail.com', 10),
       ('user2', '$2a$12$l1ZREZH/Qo24CvQXmJ3shujNSB2UussLcFcj9ObcomShAheCnPETa', 'user2@gmail.com', 20),
       ('user3', '$2a$12$l1ZREZH/Qo24CvQXmJ3shujNSB2UussLcFcj9ObcomShAheCnPETa', 'user3@gmail.com', 30);


INSERT INTO users_roles (user_id, role_id)
VALUES (1, 2),
       (2, 2),
       (3, 1);