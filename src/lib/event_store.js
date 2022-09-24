import { setStore, getStore } from "./store";
import { PLATFORM } from "../utils/constants";

const _accountEvents = "accountEvents";

export const addEventStore = async (currentAddress, currentNetwork, asset) => {
  const events = await getStore(PLATFORM, _accountEvents);
  if (!events) {
    setStore(PLATFORM, _accountEvents, [
      {
        address: currentAddress,
        data: [
          {
            network: currentNetwork,
            events: [
              {
                asset: asset.type,
                deposit_events: [],
                withdraw_events: [],
              },
            ],
          },
        ],
      },
    ]);
  } else {
    let data = events.find((i) => i.address === currentAddress);
    if (!data) {
      events.push([
        {
          address: currentAddress,
          data: [
            {
              network: currentNetwork,
              events: [
                {
                  asset: asset.type,
                  deposit_events: [],
                  withdraw_events: [],
                },
              ],
            },
          ],
        },
      ]);
      setStore(PLATFORM, _accountEvents, events);
    }
  }
};

// export const getAccountEvents = async (currentAddress) => {
//   try {
//     const data = await getStore(PLATFORM, _accountEvents);
//     if (data !== undefined || data !== null) {
//       let result = data.find((i) => i.address === currentAddress);
//       return result;
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// export const setEvents = async (currentAddress, asset) => {
//   if (currentAddress && asset) {
//     try {
//       const data = await getStore(PLATFORM, _accountEvents);
//       console.log("data setEvents", data);
//       if (data !== undefined || data !== null) {
//         let result = data.find((i) => i.address === currentAddress);
//         if (result === undefined) {
//           return false;
//         } else {
//           let events = result.events.find((i) => i.asset === asset.type);
//           if (events === undefined) {
//             result.events.push({
//               asset: asset.type,
//               deposit_events: [],
//               withdraw_events: [],
//             });
//             setStore(PLATFORM, _accountEvents, data);
//             return true;
//           } else {
//             return false;
//           }
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   } else {
//     return false;
//   }
// };

// export const getEvents = async (currentAddress, asset) => {
//   if (currentAddress && asset) {
//     try {
//       const data = await getStore(PLATFORM, _accountEvents);
//       console.log("data", data);
//       if (data !== undefined || data !== null) {
//         let result = data.find((i) => i.address === currentAddress);
//         console.log("result", result);
//         if (result === undefined) {
//           return false;
//         } else {
//           let events = result.events.find((i) => i.asset === asset.type);
//           if (events === undefined) {
//             return false;
//           } else {
//             return events;
//           }
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   } else {
//     return false;
//   }
// };
