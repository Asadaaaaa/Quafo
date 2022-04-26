<<<<<<< HEAD
const Sleep = {
    sleep: (second = 0) => {
        return new Promise((resolve) => {
            setTimeout(resolve, second * 1000);
        });
    },
    msleep: (milisecond = 0) => {
        return new Promise((resolve) => {
            setTimeout(resolve, milisecond);
        });
    }
}

=======
const Sleep = {
    sleep: (second = 0) => {
        return new Promise((resolve) => {
            setTimeout(resolve, second * 1000);
        });
    },
    msleep: (milisecond = 0) => {
        return new Promise((resolve) => {
            setTimeout(resolve, milisecond);
        });
    }
}

>>>>>>> 73634b6 (main)
export default Sleep;