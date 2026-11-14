# Signpost (OSINT)

## The challenge

> This year's hiking adventure was amazing. Where was this photo taken?

We get a photo of a rocky mountain slope with a yellow hiking signpost, prayer flags and many stacked stone cairns. The answer is submitted by clicking on a map in a location picker (rate-limited to 3 tries per minute).

## Step 1: Metadata

The EXIF data showed only the camera (iPhone 15 Pro) and the date. No GPS coordinates, so the location had to come from the image itself.

## Step 2: Reading the signs

Zooming into the full-resolution image:

- The yellow arrow says **"Dresdner Hütte"**. Yellow signs of this style are used by the Austrian/German Alpine clubs.
- The small white sign above it shows an **altitude around 2670 m**.

Dresdner Hütte is a mountain hut in the **Stubai Alps, Tyrol, Austria**, next to the Stubai Glacier cable car.

## Step 3: The mistake

My first attempts were at the hut itself and the area around it. All were rejected. Comparing with Google Maps photos looked convincing, but the numbers did not fit: the hut is at **2308 m**, while the signpost shows about **2670 m**. Also, an arrow pointing *to* Dresdner Hütte means the photo was taken *away* from it.

## Step 4: The pass with the cairns

The Stubaier Höhenweg trail goes from Dresdner Hütte over a pass to Sulzenauhütte. Hiking guides describe that pass, the **Peiljoch / Beiljoch (2672 m)**, as famous for its **dozens of Steinmänner (stone cairns)**. That matches both the altitude and the photo.

On the OpenStreetMap layer of the location picker the pass is marked as **"Beiljoch 2672 m"**, about 1.3 km south-east of the hut. Placing the pin on the pass symbol was accepted.

## Flag

`PP{any0ne-w4nts-to-h1k3-n0w?::o74u9iB3au18}`

## Takeaway

Don't stop at the first name you can read. The destination on a signpost tells you where you are *not*. Small details like altitude are often the decisive clue.
