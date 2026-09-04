const sharp = require("sharp");

function getYoutubeId(url) {
    if (!url) return null;

    url = url.trim();

    if (url.includes("watch?v=")) {
        return url.split("watch?v=")[1].split("&")[0];
    }

    if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1].split("?")[0].split("&")[0];
    }

    if (url.includes("/embed/")) {
        return url.split("/embed/")[1].split("?")[0].split("&")[0];
    }

    if (url.includes("/shorts/")) {
        return url.split("/shorts/")[1].split("?")[0].split("&")[0];
    }

    return null;
}


async function generatePlayButton(imageBuffer) {

    const playButton = `
        <svg width="140" height="140" xmlns="http://www.w3.org/2000/svg">
            <circle
                cx="70"
                cy="70"
                r="65"
                fill="rgba(220,53,69,0.95)"
            />
            <polygon
                points="55,40 55,100 105,70"
                fill="white"
            />
        </svg>
    `;

    return await sharp(imageBuffer)
        .resize(1200, 630, {
            fit: "cover",
            position: "centre"
        })
        .composite([
            {
                input: Buffer.from(playButton),
                gravity: "centre"
            }
        ])
        .jpeg({ quality: 90 })
        .toBuffer();
}


async function generateVideoPreview(video) {

    // -----------------------------
    // YOUTUBE VIDEO
    // -----------------------------

    if (video.youtube_url) {

        const youtubeId = getYoutubeId(video.youtube_url);

        if (!youtubeId) {
            throw new Error("Invalid YouTube URL");
        }

        const thumbnailUrl =
            `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

        const response = await fetch(thumbnailUrl);

        if (!response.ok) {
            throw new Error("Unable to fetch YouTube thumbnail");
        }

        const imageBuffer =
            Buffer.from(await response.arrayBuffer());

        return await generatePlayButton(imageBuffer);
    }


    // -----------------------------
    // DIRECT / CLOUDINARY VIDEO
    // -----------------------------

    if (video.video_url) {

        let cloudinaryUrl = video.video_url.trim();

        /*
         * Convert Cloudinary video URL into
         * an image generated from the first frame.
         *
         * Example:
         *
         * /video/upload/v123/file.mp4
         *
         * becomes:
         *
         * /video/upload/so_0/v123/file.jpg
         */

        cloudinaryUrl = cloudinaryUrl
            .replace(
                "/video/upload/",
                "/video/upload/so_0/"
            )
            .replace(
                /\.(mp4|webm|mov|mkv|3gp|avi|mpeg|mpg)$/i,
                ".jpg"
            );

        const response = await fetch(cloudinaryUrl);

        if (!response.ok) {
            throw new Error(
                "Unable to fetch Cloudinary video frame"
            );
        }

        const imageBuffer =
            Buffer.from(await response.arrayBuffer());

        return await generatePlayButton(imageBuffer);
    }


    throw new Error("No video source found");
}


module.exports = {
    generateVideoPreview
};