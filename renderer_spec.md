# Implementacja renderera

Zaprojektować i napisać aplikację realizującą wybrane kroki potoku renderingu nie używając bibliotek graficznych.

    Wejście
        aplikacja zawiera w kodzie źródłowym opis sceny (zbiór transformacji, obiektów geometrycznych, świateł i parametry punktu widzenia) - analogiczny do np. kodu OpenGL,
        opcjonalne pliki graficzne z teksturami,
        opcjonalne pliki z obiektami 3D.
    Wyjście
        plik w wybranym formacie graficznym 2D zawierający wyrenderowaną scenę,
        opcjonalnie prezentacja wyrenderowanego obrazu przez aplikację.
    Elementy obowiązkowe działania aplikacji (ocena bazowa 3.0):
        rasteryzacja trójkątów wraz z: interpolacją koloru, obcinaniem, buforem głębokości,
        transformacje 3D i rzutowanie na 2D,
        oświetlenie obliczane w wierzchołkach z wykorzystaniem wybranego typu światła,
        konstrukcja i rendering trzech wybranych trójwymiarowych obiektów prymitywnych (np. sześcian, sfera, stożek, torus, walec),
        rendering sceny zawierającej co najmniej 7 obiektów.
    Elementy dodatkowe podwyższajęce ocenę:
        oświetlenie obliczane w pikselach /+0.25/,
        źródło światła spot/reflektorowego oraz tłumienie światła wraz z odległością (attenuation) /+0.5/,
        teksturowanie z dwoma rodzajami filtrowania (metoda najbliższego sąsiada i interpolacja liniowa) /+0.5/,
        teksturowanie z dwoma rodzajami adresowania (zawijanie i powtarzanie) /+0.25/,
        wczytywanie geometrii 3D z pliku zewnętrznego - zwalnia z konieczności samodzielnego konstruowania obiektów prymitywnych /+0.5/,
        prezentacja wyrenderowanego obrazu przez aplikację - szybkość renderingu powinna przekraczać 15 fps /+0.25/,
        możliwość wykorzystania przez aplikację więcej, niż jednego źródła światła i więcej niż jednego rodzaju światła /+0.25/,
        możliwość wykorzystania przez aplikację więcej, niż jednej tekstury (indywidualne tekstury dla obiektów) /+0.25/,
        samodzielnie zaproponowany i zaakceptowany wcześniej przez prowadzącego algorytm grafiki /+0.25...+1.0/.