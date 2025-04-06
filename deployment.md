# Database

ShortUrl for Cloudflare Worker use [D1 database](https://developers.cloudflare.com/d1/) for data storing.

First, you need to create a D1 database.

1. In Cloudflare dashboard, navigate to ``Storage & Databases`` - ``D1 SQL Database``. The menu items may be changed.
2. Press ``+ Create`` button to create a new database, specifying a name like ``shorturl``.
3. Go to ``Console`` tab of this database. Enter these 4 lines from [dbinit.sql](dbinit.sql) one by one, hitting ``Execute`` button for each line.
4. (Optional) Go to ``Tables`` tab of this database. Make sure 4 tables are created.

# Worker

Let's initialize the worker after database created.

1. In Cloudflare dashboard, navigate to ``Workers & Pages`` - ``Workers & Pages``. The menu items may be changed.
2. Press ``Create`` button, then press ``Hello world`` button. Specify the name of the worker, like ``shorturl``, and press ``Deploy``.
3. After deployed, press ``Continue to project`` button.
4. In the worker page for this created worker, navivate to ``Settings`` tab. There is a ``Domains & Routes``. You need to add the domains for this worker later here. Now, remember the value of ``workers.dev`` here.
5. In ``Bindings`` block, press ``+ Add``, choose ``D1 database``. Variable name should be ``DB``. Select the database created under D1 database and press ``Deploy``.
6. Press ``Edit code`` in the page of step 4. Currently, this button is a icon without text near the top right corner.
7. Copy and paste all lines from [index.js](index.js) in to it and press ``Deploy`` button.
8. Navigate to the domain retrieved from step 4 with ``/$$$$GlobalManagement$$$$`` as postfix, like ``https://shorturl.myname.worker.dev/$$$$GlobalManagement$$$$``.
9. If the page is opened correctly, you can continue to [management](management.md).
