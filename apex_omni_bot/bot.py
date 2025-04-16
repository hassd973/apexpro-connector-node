
import time
import decimal
from apexpro.http_private_v3 import HttpPrivate_v3
from apexpro.constants import APEX_OMNI_HTTP_MAIN, NETWORKID_MAIN

# Setup credentials
key = os.getenv("APEX_API_KEY")
secret = os.getenv("APEX_API_SECRET")
passphrase = os.getenv("APEX_API_PASSPHRASE")

client = HttpPrivate_v3(
    APEX_OMNI_HTTP_MAIN,
    network_id=NETWORKID_MAIN,
    api_key_credentials={"key": key, "secret": secret, "passphrase": passphrase}
)

def get_user_info():
    user = client.get_user_v3()
    print("👤 User Info:", user)

def get_account_balance():
    balance = client.get_account_balance_v3()
    print("💰 Account Balance:", balance)

def place_market_order():
    now = time.time()
    res = client.create_order_v3(
        symbol="BTC-USDT",
        side="SELL",
        type="MARKET",
        size="0.001",
        timestampSeconds=now,
        price="60000"
    )
    print("🛒 Market Order Response:", res)

def place_tp_sl_order():
    slippage = decimal.Decimal("-0.1")
    sl_price = decimal.Decimal("58000") * (decimal.Decimal("1") + slippage)
    tp_price = decimal.Decimal("79000") * (decimal.Decimal("1") - slippage)

    res = client.create_order_v3(
        symbol="BTC-USDT",
        side="BUY",
        type="LIMIT",
        size="0.01",
        price="65000",
        isOpenTpslOrder=True,
        isSetOpenSl=True,
        slPrice=sl_price,
        slSide="SELL",
        slSize="0.01",
        slTriggerPrice="58000",
        isSetOpenTp=True,
        tpPrice=tp_price,
        tpSide="SELL",
        tpSize="0.01",
        tpTriggerPrice="79000"
    )
    print("🎯 TP/SL Order Response:", res)

if __name__ == "__main__":
    get_user_info()
    get_account_balance()
    place_market_order()
    place_tp_sl_order()
