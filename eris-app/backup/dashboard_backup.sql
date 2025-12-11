--
-- PostgreSQL database dump
--

\restrict NixESaypFYktxxrnhmBj99RzFPZAOs2wvwinwPPz3yQgimrBlvJQFMGHxgmb2NN

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

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
-- Name: dashboard_widgets; Type: TABLE; Schema: public; Owner: eris
--

CREATE TABLE public.dashboard_widgets (
    id text NOT NULL,
    dashboard_id text NOT NULL,
    template_id text NOT NULL,
    x integer,
    y integer,
    w integer,
    h integer,
    config text
);


ALTER TABLE public.dashboard_widgets OWNER TO eris;

--
-- Name: widget_templates; Type: TABLE; Schema: public; Owner: eris
--

CREATE TABLE public.widget_templates (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "defaultConfig" text
);


ALTER TABLE public.widget_templates OWNER TO eris;

--
-- Name: widgets; Type: TABLE; Schema: public; Owner: eris
--

CREATE TABLE public.widgets (
    id text NOT NULL,
    dashboard_id text NOT NULL,
    title text,
    type text,
    x integer,
    y integer,
    w integer,
    h integer,
    value text,
    content text,
    icon text,
    color text
);


ALTER TABLE public.widgets OWNER TO eris;

--
-- Data for Name: dashboard_widgets; Type: TABLE DATA; Schema: public; Owner: eris
--

COPY public.dashboard_widgets (id, dashboard_id, template_id, x, y, w, h, config) FROM stdin;
w_1765319154812	main	874486ba-4816-48cd-8f0d-8163f21b4022	0	0	2	2	{"title":"PR Request","icon":"cart","color":"bg-orange-500","content":"{\\"link\\":\\"/purchase/request\\",\\"label\\":\\"Go to Home\\"}"}
w_1765290405815	main	a9c28248-a1e0-47fa-b6ee-1d34e195ee43	2	0	2	2	{"title":"New Pie Chart","icon":null,"color":null,"content":"{\\"subtitle\\":\\"Conversion\\",\\"target\\":\\"100%\\",\\"footer\\":\\"Monthly\\"}"}
w9	main	a9c28248-a1e0-47fa-b6ee-1d34e195ee43	4	0	2	2	{"title":"Sales Contract Fulfilment","icon":null,"color":null,"content":"{\\"subtitle\\":\\"EMEA\\",\\"target\\":\\"3M\\",\\"footer\\":\\"EUR, Year to Date\\"}"}
w4	main	592650e6-a7d5-4ef8-b9d7-5c00c9d491b3	6	0	2	2	{"title":"Team Members","icon":"users","color":"bg-green-500","content":"{}"}
w_1765343645080	main	6980438e-f30b-42eb-b5fc-0c39063a3b1d	8	0	4	4	{"title":"New Picture","icon":null,"color":null,"content":"{\\"src\\":\\"https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80\\",\\"caption\\":\\"Office Space\\"}"}
w10	main	cdbd05e1-195f-4d1a-9104-58e47e9eb060	0	2	4	2	{"title":"Ext. Sales Commissions","icon":null,"color":null,"content":"{\\"value1\\":\\"70M\\",\\"value2\\":\\"45M\\",\\"labelStart\\":\\"June\\",\\"labelEnd\\":\\"June 30\\"}"}
w_1765290396251	main	8157c8ef-b05d-4ebf-b6b3-3090fc99d802	4	2	2	2	{"title":"New List","icon":null,"color":null,"content":"{\\"listItems\\":[{\\"label\\":\\"Item 1\\",\\"value\\":\\"100\\",\\"colorClass\\":\\"text-green-600\\"},{\\"label\\":\\"Item 2\\",\\"value\\":\\"50\\",\\"colorClass\\":\\"text-red-600\\"}],\\"footer\\":\\"Just now\\"}"}
w_1765290784900	main	0c2f71fc-6c0a-4356-98b1-8ff3f0bb3607	6	2	2	2	{"title":"New Bar Chart","icon":null,"color":null,"content":"{\\"subtitle\\":\\"Sales\\",\\"unit\\":\\"M\\",\\"footer\\":\\"YTD\\",\\"chartData\\":[{\\"value\\":30,\\"colorClass\\":\\"bg-blue-400\\"},{\\"value\\":60,\\"colorClass\\":\\"bg-blue-600\\"},{\\"value\\":45,\\"colorClass\\":\\"bg-blue-500\\"}]}"}
\.


--
-- Data for Name: widget_templates; Type: TABLE DATA; Schema: public; Owner: eris
--

COPY public.widget_templates (id, name, type, "defaultConfig") FROM stdin;
a9c28248-a1e0-47fa-b6ee-1d34e195ee43	New Pie Chart	pie	{"title":"New Pie Chart","icon":null,"color":null,"content":"{\\"subtitle\\":\\"Conversion\\",\\"target\\":\\"100%\\",\\"footer\\":\\"Monthly\\"}"}
874486ba-4816-48cd-8f0d-8163f21b4022	PR Request	shortcut	{"title":"PR Request","icon":"cart","color":"bg-orange-500","content":"{\\"link\\":\\"/purchase/request\\",\\"label\\":\\"Go to Home\\"}"}
592650e6-a7d5-4ef8-b9d7-5c00c9d491b3	Team Members	stat	{"title":"Team Members","icon":"users","color":"bg-green-500","content":"{}"}
6980438e-f30b-42eb-b5fc-0c39063a3b1d	New Picture	picture	{"title":"New Picture","icon":null,"color":null,"content":"{\\"src\\":\\"https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80\\",\\"caption\\":\\"Office Space\\"}"}
8157c8ef-b05d-4ebf-b6b3-3090fc99d802	New List	list	{"title":"New List","icon":null,"color":null,"content":"{\\"listItems\\":[{\\"label\\":\\"Item 1\\",\\"value\\":\\"100\\",\\"colorClass\\":\\"text-green-600\\"},{\\"label\\":\\"Item 2\\",\\"value\\":\\"50\\",\\"colorClass\\":\\"text-red-600\\"}],\\"footer\\":\\"Just now\\"}"}
0c2f71fc-6c0a-4356-98b1-8ff3f0bb3607	New Bar Chart	bar	{"title":"New Bar Chart","icon":null,"color":null,"content":"{\\"subtitle\\":\\"Sales\\",\\"unit\\":\\"M\\",\\"footer\\":\\"YTD\\",\\"chartData\\":[{\\"value\\":30,\\"colorClass\\":\\"bg-blue-400\\"},{\\"value\\":60,\\"colorClass\\":\\"bg-blue-600\\"},{\\"value\\":45,\\"colorClass\\":\\"bg-blue-500\\"}]}"}
cdbd05e1-195f-4d1a-9104-58e47e9eb060	Ext. Sales Commissions	line	{"title":"Ext. Sales Commissions","icon":null,"color":null,"content":"{\\"value1\\":\\"70M\\",\\"value2\\":\\"45M\\",\\"labelStart\\":\\"June\\",\\"labelEnd\\":\\"June 30\\"}"}
e67eddd4-0ade-4d1b-910c-83d479f59e83	New Widget	stat	{"title":"New Widget"}
cc0b81ef-25a9-453c-936c-6bef5ab3f08f	New Widget	stat	{"title":"New Widget"}
\.


--
-- Data for Name: widgets; Type: TABLE DATA; Schema: public; Owner: eris
--

COPY public.widgets (id, dashboard_id, title, type, x, y, w, h, value, content, icon, color) FROM stdin;
w_1765290405815	main	New Pie Chart	pie	0	0	2	2	75%	{"subtitle":"Conversion","target":"100%","footer":"Monthly"}	\N	\N
w_1765319154812	main	PR Request	shortcut	2	0	2	2	\N	{"link":"/purchase/request","label":"Go to Home"}	cart	bg-orange-500
w9	main	Sales Contract Fulfilment	pie	4	0	2	2	1.8M	{"subtitle":"EMEA","target":"3M","footer":"EUR, Year to Date"}	\N	\N
w4	main	Team Members	stat	6	0	2	2	48	{}	users	bg-green-500
w_1765343645080	main	New Picture	picture	8	0	4	2	\N	{"src":"https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80","caption":"Office Space"}	\N	\N
w_1765292391081	main	Training Request	shortcut	0	2	2	2	\N	{"link":"/training/request","label":"home"}	user	bg-blue-500
w_1765290396251	main	New List	list	2	2	2	2	\N	{"listItems":[{"label":"Item 1","value":"100","colorClass":"text-green-600"},{"label":"Item 2","value":"50","colorClass":"text-red-600"}],"footer":"Just now"}	\N	\N
w_1765290784900	main	New Bar Chart	bar	4	2	2	2	1.2M	{"subtitle":"Sales","unit":"M","footer":"YTD","chartData":[{"value":30,"colorClass":"bg-blue-400"},{"value":60,"colorClass":"bg-blue-600"},{"value":45,"colorClass":"bg-blue-500"}]}	\N	\N
w6	main	Critical Issues	stat	6	2	2	2	3	{}	alert-triangle	bg-red-500
w5	main	Conversion Rate	stat	8	2	2	2	65.5	{}	trending-up	bg-green-600
w3	main	Pending Approval	stat	10	2	2	2	5	{}	clock	bg-orange-500
w1	main	Total Revenue	stat	0	4	2	2	Rp 2.5B	{}	dollar-sign	bg-blue-500
w_1765290393125	main	New Stat	stat	2	4	2	2	0	{}	activity	bg-blue-500
w10	main	Ext. Sales Commissions	line	4	4	3	2	\N	{"value1":"70M","value2":"45M","labelStart":"June","labelEnd":"June 30"}	\N	\N
w_1765290783908	main	New List	list	7	4	2	2	\N	{"listItems":[{"label":"Item 1","value":"100","colorClass":"text-green-600"},{"label":"Item 2","value":"50","colorClass":"text-red-600"}],"footer":"Just now"}	\N	\N
w_1765290407167	main	New Line Chart	line	9	4	3	2	\N	{"value1":"100","value2":"80","labelStart":"Jan","labelEnd":"Dec"}	\N	\N
\.


--
-- Name: dashboard_widgets dashboard_widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: eris
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_pkey PRIMARY KEY (id);


--
-- Name: widget_templates widget_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: eris
--

ALTER TABLE ONLY public.widget_templates
    ADD CONSTRAINT widget_templates_pkey PRIMARY KEY (id);


--
-- Name: widgets widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: eris
--

ALTER TABLE ONLY public.widgets
    ADD CONSTRAINT widgets_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widgets dashboard_widgets_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: eris
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.widget_templates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict NixESaypFYktxxrnhmBj99RzFPZAOs2wvwinwPPz3yQgimrBlvJQFMGHxgmb2NN

