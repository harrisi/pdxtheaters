import { screenings } from '$db/screenings';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Los_Angeles');

export async function cinemagic() {
  // definitely need to change this.
  const movieData = await fetch("https://tickets.thecinemagictheater.com/graphql", {
      "credentials": "include",
      "headers": {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.5",
          "content-type": "application/json",
          "is-electron-mode": "false",
          "site-id": "40",
          "circuit-id": "39",
          "client-type": "consumer",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
      },
      "referrer": "https://tickets.thecinemagictheater.com/now-showing/",
      "body": "{\"operationName\":null,\"variables\":{\"movieId\":null,\"titleClassId\":null,\"titleClassIds\":null,\"anyShowingBadgeIds\":null,\"everyShowingBadgeIds\":[null],\"skip\":false,\"resultVersion\":null},\"query\":\"query ($date: String, $movieId: ID, $titleClassId: ID, $titleClassIds: [ID], $everyShowingBadgeIds: [ID], $anyShowingBadgeIds: [ID], $resultVersion: String) {\\n  showingsForDate(\\n    date: $date\\n    movieId: $movieId\\n    titleClassId: $titleClassId\\n    titleClassIds: $titleClassIds\\n    everyShowingBadgeIds: $everyShowingBadgeIds\\n    anyShowingBadgeIds: $anyShowingBadgeIds\\n    resultVersion: $resultVersion\\n  ) {\\n    data {\\n      id\\n      time\\n      overrideSeatChart\\n      overridePriceCard\\n      published\\n      ticketsSold\\n      ticketsPaid\\n      current\\n      past\\n      overrideReservedSeating\\n      overrideReservedSeatingValue\\n      customHeldSeatCount\\n      overrideHeldSeatCount\\n      overrideShowingBadges\\n      allowWithoutMembership\\n      private\\n      displayMetaData\\n      screenId\\n      priceCardId\\n      customPriceCardId\\n      movie {\\n        id\\n        name\\n        showingStatus\\n        displayMetaData\\n        urlSlug\\n        posterImage\\n        signageDisplayPoster\\n        bannerImage\\n        signageDisplayBanner\\n        animatedPosterVideo\\n        signageDisplayAnimatedPoster\\n        signageMessageOverride\\n        color\\n        synopsis\\n        starring\\n        directedBy\\n        producedBy\\n        searchTerms\\n        duration\\n        genre\\n        allGenres\\n        rating\\n        ratingReason\\n        trailerYoutubeId\\n        trailerVideo\\n        signageDisplayTrailer\\n        releaseDate\\n        predictedWeekOneTicketSales\\n        tmdbPopularityScore\\n        tmdbId\\n        includeInComingSoon\\n        includeInFuture\\n        overridePriceCard\\n        sendRentrak\\n        rentrakName\\n        allowPastSales\\n        dcmEdiMovieId\\n        dcmEdiMovieName\\n        disableOnlineConcessions\\n        distributionTerms\\n        titleClassId\\n        customPriceCardId\\n        __typename\\n      }\\n      showingBadgeIds\\n      predictedAttendance\\n      seatsRemaining\\n      seatsRemainingWithoutSocialDistancing\\n      __typename\\n    }\\n    count\\n    resultVersion\\n    __typename\\n  }\\n}\\n\"}",
      "method": "POST",
      "mode": "cors"
  })
  .then(res => res.json())
  .then(json => json.data.showingsForDate.data);

  const toInsert = []

  for (const movie of movieData) {
      const movieName = movie.movie.name;
      const showingTime = movie.time;
      const showingTimeParsed = dayjs(showingTime).format('YYYY-MM-DD HH:mm');
      toInsert.push({
        theater_name: 'Cinemagic',
        movie_title: movieName,
        showtime: showingTimeParsed,
      })
  }

  // console.log(toInsert)

  await screenings.insert(toInsert)
}