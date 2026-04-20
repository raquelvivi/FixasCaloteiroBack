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

CREATE TABLE mercado
(
    id serial Primary Key NOT NULL,
    nome character varying(100) NOT NULL,
    senha character varying(150) NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW();

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


-- COMPRA
ALTER TABLE compra
ADD COLUMN criado_em TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT NOW();

-- FIXA
ALTER TABLE fixa
ADD COLUMN criado_em TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT NOW();

-- FUNCIO
ALTER TABLE funcio
ADD COLUMN criado_em TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT NOW();


-- Função reutilizável
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- COMPRA
CREATE TRIGGER trigger_compra_atualizado
BEFORE UPDATE ON compra
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- FIXA
CREATE TRIGGER trigger_fixa_atualizado
BEFORE UPDATE ON fixa
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- FUNCIO
CREATE TRIGGER trigger_funcio_atualizado
BEFORE UPDATE ON funcio
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- Mercado
CREATE TRIGGER trigger_mercado_atualizado
BEFORE UPDATE ON mercado
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- 1. Adiciona a coluna
ALTER TABLE fixa
ADD COLUMN idmercado INTEGER;

-- 2. Cria a chave estrangeira
ALTER TABLE fixa
ADD CONSTRAINT fixa_idmercado_fkey
FOREIGN KEY (idmercado)
REFERENCES mercado(id)
ON UPDATE NO ACTION
ON DELETE NO ACTION;