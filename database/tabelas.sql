CREATE TABLE compra
(
    id serial NOT NULL,
    dia date,
    total double precision,
    apagar double precision,
    tipopag character varying(20) COLLATE pg_catalog."default",
    idfuncio integer NOT NULL,
    idfixa integer NOT NULL,
    CONSTRAINT compra_pkey PRIMARY KEY (id)
);

CREATE TABLE fixa
(
    id serial NOT NULL,
    nome character varying(50) COLLATE pg_catalog."default" NOT NULL,
    apelido character varying(50) COLLATE pg_catalog."default",
    logradouro character varying(50) COLLATE pg_catalog."default",
    numero character varying(10) COLLATE pg_catalog."default",
    bairro character varying(50) COLLATE pg_catalog."default",
    creditomax double precision NOT NULL,
    foto bytea,
    datapaga integer,
    tipofoto text COLLATE pg_catalog."default",
    CONSTRAINT fixa_pkey PRIMARY KEY (id),
    CONSTRAINT fixa_nome_key UNIQUE (nome)
);

CREATE TABLE funcio
(
    id serial NOT NULL,
    nome character varying(50) COLLATE pg_catalog."default" NOT NULL,
    login character varying(15) COLLATE pg_catalog."default" NOT NULL,
    senha character varying(150) COLLATE pg_catalog."default" NOT NULL,
    tipo character varying(15) COLLATE pg_catalog."default",
    CONSTRAINT funcio_pkey PRIMARY KEY (id),
    CONSTRAINT funcio_login_key UNIQUE (login),
    CONSTRAINT funcio_nome_key UNIQUE (nome)
);

ALTER TABLE compra
    ADD CONSTRAINT compra_idfixa_fkey FOREIGN KEY (idfixa)
    REFERENCES public.fixa (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE compra
    ADD CONSTRAINT compra_idfuncio_fkey FOREIGN KEY (idfuncio)
    REFERENCES public.funcio (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;