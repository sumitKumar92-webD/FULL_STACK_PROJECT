maptilersdk.config.apiKey = mapToken;

const map = new maptilersdk.Map({
    container: "map",
    style: maptilersdk.MapStyle.STREETS,
    center: coordinates,
    zoom: 9
});

new maptilersdk.Marker({
    color: "red"
})
.setLngLat(coordinates)
.setPopup(
    new maptilersdk.Popup({ offset: 25 })
        .setHTML("<h4>My Listing</h4>")
)
.addTo(map);