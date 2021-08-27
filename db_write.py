from aurorapy.client import AuroraError, AuroraSerialClient
from app import db
from app.models import PVData
import requests

client = AuroraSerialClient(port='/dev/ttyUSB0', address=2, parity='N')
client.connect()

try:
    #print("Inverter serial number: %s" % client.serial_number())
    
    grid_voltage = client.measure(1)
    grid_current = client.measure(2)
    grid_power = client.measure(3)
    invert_temp = client.measure(21)
    booster_temp = client.measure(22)
    pwr_peak = client.measure(34)
    pwr_peak_td = client.measure(35)
    nrg_td = client.cumulated_energy(0)
    nrg = client.cumulated_energy(5)
    
    db_entry = PVData(grid_voltage=round(grid_voltage, 1),
                      grid_current=round(grid_current, 1),
                      grid_power=int(grid_power),
                      invert_temp=round(invert_temp, 1),
                      booster_temp=round(booster_temp, 1),
                      pwr_peak=int(pwr_peak),
                      pwr_peak_td=int(pwr_peak_td),
                      nrg_td=int(nrg_td),
                      nrg=int(nrg))
    
    db.session.add(db_entry)
    db.session.commit()

    r = requests.post("http://scandav.pythonanywhere.com/new", 
        json={'grid_voltage': grid_voltage, 
              'grid_current': grid_current, 
              'grid_power': grid_power,
              'invert_temp': invert_temp,
              'booster_temp': booster_temp,
              'pwr_peak': pwr_peak,
              'pwr_peak_td': pwr_peak_td,
              'nrg_td': nrg_td,
              'nrg': nrg}
    )

    # r = requests.post("http://localhost:5000/new", 
    #     json={'grid_voltage': 0, 
    #           'grid_current': 0, 
    #           'grid_power': 0,
    #           'invert_temp': 0,
    #           'booster_temp': 0,
    #           'pwr_peak': 0,
    #           'pwr_peak_td': 0,
    #           'nrg_td': 0,
    #           'nrg': 0}
    # )

    # print(r.status_code)

except AuroraError as e:
    print(str(e))
    db.session.rollback()



#print client.measure(3)
#print client.measure(34)
#print client.measure(35)
#print client.cumulated_energy(period=5)

client.close()
