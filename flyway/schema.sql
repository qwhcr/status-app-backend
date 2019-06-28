CREATE TABLE tb_user (
    uuid UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fk_room_uuid UUID,
    current_status_uuid UUID,
    is_admin BOOLEAN,

    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE tb_user_status (
    uuid UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    fk_user_uuid UUID NOT NULL,
    quietness INTEGER,
    is_scheduled BOOLEAN NOT NULL,
    scheduled_time_from TIME WITHOUT TIME ZONE, --ISO 8601: 010203
    scheduled_time_to TIME WITHOUT TIME ZONE,

    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE tb_room (
    uuid UUID NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    updated_by UUID NOT NULL
)
