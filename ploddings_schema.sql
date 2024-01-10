--
-- PostgreSQL database dump
--

-- Dumped from database version 12.17 (Ubuntu 12.17-1.pgdg22.04+1)
-- Dumped by pg_dump version 12.17 (Ubuntu 12.17-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blog; Type: TABLE; Schema: public; Owner: blah148
--

CREATE TABLE public.blog (
    blog_id integer NOT NULL,
    blog_name character varying(255),
    meta_description character varying(255),
    featured_img_alt_text character varying(255),
    custom_index smallint,
    published_date date,
    color_code character varying(7),
    tuning integer,
    thread_parent integer,
    sibling_previous integer,
    sibling_next integer,
    capo_position integer,
    pagination_title character varying(255),
    featured_img character varying(255)
);


ALTER TABLE public.blog OWNER TO blah148;

--
-- Name: blog_blog_id_seq; Type: SEQUENCE; Schema: public; Owner: blah148
--

CREATE SEQUENCE public.blog_blog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.blog_blog_id_seq OWNER TO blah148;

--
-- Name: blog_blog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: blah148
--

ALTER SEQUENCE public.blog_blog_id_seq OWNED BY public.blog.blog_id;


--
-- Name: capo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.capo (
    capo_id integer NOT NULL,
    capo_position character varying(255)
);


ALTER TABLE public.capo OWNER TO postgres;

--
-- Name: capo_capo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.capo_capo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.capo_capo_id_seq OWNER TO postgres;

--
-- Name: capo_capo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.capo_capo_id_seq OWNED BY public.capo.capo_id;


--
-- Name: tuning; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tuning (
    tuning_id integer NOT NULL,
    tuning_name character varying(255),
    anchored_musescore_link character varying(255)
);


ALTER TABLE public.tuning OWNER TO postgres;

--
-- Name: guitar_setup_guitar_setup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guitar_setup_guitar_setup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guitar_setup_guitar_setup_id_seq OWNER TO postgres;

--
-- Name: guitar_setup_guitar_setup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.guitar_setup_guitar_setup_id_seq OWNED BY public.tuning.tuning_id;


--
-- Name: junction_blogs_to_blogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.junction_blogs_to_blogs (
    blog_id1 integer NOT NULL,
    blog_id2 integer NOT NULL,
    custom_index character varying(7)
);


ALTER TABLE public.junction_blogs_to_blogs OWNER TO postgres;

--
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    log_id integer NOT NULL,
    log_name character varying(255),
    published_date date,
    log_link character varying(255),
    color character varying(7)
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- Name: logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.logs_log_id_seq OWNER TO postgres;

--
-- Name: logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_log_id_seq OWNED BY public.logs.log_id;


--
-- Name: songs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.songs (
    song_id integer NOT NULL,
    song_name character varying(255),
    meta_description character varying(255),
    thread_id integer,
    musescore_embed character varying(255),
    extra_notes text,
    tuning integer,
    dropbox_mp3_link character varying(255),
    youtube_link character varying(255),
    custom_index smallint,
    lyrics text,
    pdf_embed character varying(255),
    stripe_checkout_link character varying(255),
    capo_position integer
);


ALTER TABLE public.songs OWNER TO postgres;

--
-- Name: songs_song_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.songs_song_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.songs_song_id_seq OWNER TO postgres;

--
-- Name: songs_song_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.songs_song_id_seq OWNED BY public.songs.song_id;


--
-- Name: threads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.threads (
    thread_id integer NOT NULL,
    thread_name character varying(255),
    meta_description character varying(255),
    custom_index smallint,
    blurb text,
    featured_img_alt_text character varying(255),
    life_and_death character varying(255),
    estimated_time character varying(255),
    description text,
    wikipedia character varying(255),
    discography character varying(255),
    faq_1 character varying(255),
    answer_1 text,
    faq_2 character varying(255),
    answer_2 text,
    faq_3 character varying(255),
    answer_3 text,
    featured_img character varying(255),
    featured_img_550px character varying(255),
    featured_img_200px character varying(255)
);


ALTER TABLE public.threads OWNER TO postgres;

--
-- Name: threads_thread_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.threads_thread_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.threads_thread_id_seq OWNER TO postgres;

--
-- Name: threads_thread_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.threads_thread_id_seq OWNED BY public.threads.thread_id;


--
-- Name: blog blog_id; Type: DEFAULT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog ALTER COLUMN blog_id SET DEFAULT nextval('public.blog_blog_id_seq'::regclass);


--
-- Name: capo capo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capo ALTER COLUMN capo_id SET DEFAULT nextval('public.capo_capo_id_seq'::regclass);


--
-- Name: logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs ALTER COLUMN log_id SET DEFAULT nextval('public.logs_log_id_seq'::regclass);


--
-- Name: songs song_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs ALTER COLUMN song_id SET DEFAULT nextval('public.songs_song_id_seq'::regclass);


--
-- Name: threads thread_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.threads ALTER COLUMN thread_id SET DEFAULT nextval('public.threads_thread_id_seq'::regclass);


--
-- Name: tuning tuning_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuning ALTER COLUMN tuning_id SET DEFAULT nextval('public.guitar_setup_guitar_setup_id_seq'::regclass);


--
-- Name: blog blog_pkey; Type: CONSTRAINT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_pkey PRIMARY KEY (blog_id);


--
-- Name: capo capo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.capo
    ADD CONSTRAINT capo_pkey PRIMARY KEY (capo_id);


--
-- Name: tuning guitar_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuning
    ADD CONSTRAINT guitar_setup_pkey PRIMARY KEY (tuning_id);


--
-- Name: junction_blogs_to_blogs junction_blogs_to_blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.junction_blogs_to_blogs
    ADD CONSTRAINT junction_blogs_to_blogs_pkey PRIMARY KEY (blog_id1, blog_id2);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (log_id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (song_id);


--
-- Name: threads threads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.threads
    ADD CONSTRAINT threads_pkey PRIMARY KEY (thread_id);


--
-- Name: blog blog_capo_position_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_capo_position_fkey FOREIGN KEY (capo_position) REFERENCES public.capo(capo_id);


--
-- Name: blog blog_guitar_setup_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_guitar_setup_fkey FOREIGN KEY (tuning) REFERENCES public.tuning(tuning_id);


--
-- Name: blog blog_sibling_next_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_sibling_next_fkey FOREIGN KEY (sibling_next) REFERENCES public.blog(blog_id);


--
-- Name: blog blog_sibling_previous_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_sibling_previous_fkey FOREIGN KEY (sibling_previous) REFERENCES public.blog(blog_id);


--
-- Name: blog blog_thread_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: blah148
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_thread_parent_fkey FOREIGN KEY (thread_parent) REFERENCES public.threads(thread_id);


--
-- Name: junction_blogs_to_blogs junction_blogs_to_blogs_blog_id1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.junction_blogs_to_blogs
    ADD CONSTRAINT junction_blogs_to_blogs_blog_id1_fkey FOREIGN KEY (blog_id1) REFERENCES public.blog(blog_id);


--
-- Name: junction_blogs_to_blogs junction_blogs_to_blogs_blog_id2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.junction_blogs_to_blogs
    ADD CONSTRAINT junction_blogs_to_blogs_blog_id2_fkey FOREIGN KEY (blog_id2) REFERENCES public.blog(blog_id);


--
-- Name: songs songs_capo_position_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_capo_position_fkey FOREIGN KEY (capo_position) REFERENCES public.capo(capo_id);


--
-- Name: songs songs_guitar_setup_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_guitar_setup_id_fkey FOREIGN KEY (tuning) REFERENCES public.tuning(tuning_id);


--
-- Name: songs songs_threads_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_threads_id_fkey FOREIGN KEY (thread_id) REFERENCES public.threads(thread_id);


--
-- PostgreSQL database dump complete
--

